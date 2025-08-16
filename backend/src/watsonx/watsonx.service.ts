import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WatsonxService {
    private readonly scoringUrl : string;
    private readonly apiKey : string;
    private readonly iamUrl = 'https://iam.cloud.ibm.com/identity/token';

    private tokenCache :{token:string;expires:number} | null = null;

    constructor(){
        if(!process.env.SCORING_URL || !process.env.WATSONX_API_KEY){
            throw new Error('missing api key or scoring url')
        }
        this.scoringUrl = process.env.SCORING_URL;
        this.apiKey = process.env.WATSONX_API_KEY;
    }

    private async getIamToken(): Promise<string> {
        try{

            if (this.tokenCache && Date.now() < this.tokenCache.expires) {
                return this.tokenCache.token;
            }

            const body = new URLSearchParams({
                grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
                apikey:this.apiKey,
            });

            const res = await axios.post(this.iamUrl,body.toString(),{
                headers:{
                    'Content-Type':'application/x-www-form-urlencoded',
                    Accept:'application/json',
                }
            });

            this.tokenCache = {
                token: res.data.access_token,
                expires: Date.now() + (3600 * 1000) - 60000 
            };

            return res.data.access_token;
        }
        catch(err:any){
            console.error('failed to get IAM token: ',err);
            throw new InternalServerErrorException('failed to authenticate with watsonx')
        }
    }

    private cleanResponse(rawData:string):{role:string;message:string}{
        let fullMessage = "";
        const lines = rawData.split('\n');

        for (let i = 0; i<lines.length;i++){
            const line = lines[i].trim();

            if(line.startsWith('data: ')){
                try{
                    const jsonStr = line.substring(6);
                    const data = JSON.parse(jsonStr);

                    if(data.choices && data.choices[0]?.delta?.content){
                        fullMessage += data.choices[0].delta.content;
                    }
                }
                catch(parseError){
                    console.warn('failed to parse SSE data line: ');
                }
            }
        }
        const result = {
            role: 'assistant',
            message: fullMessage.trim() || 'No response received'
        };

        return result;
    }


    async sendPrompt(prompt:string){

        if (!prompt || prompt.trim().length === 0) {
            throw new Error('Prompt cannot be empty');
        }

        try{
            const token = await this.getIamToken();

            const payload={
                messages:[
                    {
                        role:'user',
                        content:prompt,
                    }
                ],
                stream:true
            }
            const res = await axios.post(
                this.scoringUrl,
                payload,
                {
                    headers:{
                        Authorization:`Bearer ${token}`,
                        'Content-Type':'application/json',
                    },
                    responseType:'text',
                    timeout:30000
                }
            );

           return this.cleanResponse(res.data);

        }
        catch(err:any){
            if(axios.isAxiosError(err)){
                console.error('Error calling watsonx',err.response?.data || err.message);
            }
            else if(err instanceof Error){
                console.error('unexpected error: ',err.message);
            }
            else{
                console.error('unknown error type: ',err);
            }
            throw err;
        }
    }
}
