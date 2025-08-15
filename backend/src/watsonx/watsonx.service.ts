import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { error } from 'console';

@Injectable()
export class WatsonxService {
    private readonly scoringUrl : string;
    private readonly apiKey : string;
    private readonly iamUrl = 'https://iam.cloud.ibm.com/identity/token';

    constructor(){
        if(!process.env.SCORING_URL || !process.env.WATSONX_API_KEY){
            throw new Error('missing api key or scoring url')
        }
        this.scoringUrl = process.env.SCORING_URL;
        this.apiKey = process.env.WATSONX_API_KEY;
    }

    private async getIamToken(): Promise<string> {
        try{
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

            return res.data.access_token;
        }
        catch(err){
            console.error('failed to get IAM token: ',err);
            throw new InternalServerErrorException('failed to authenticate with watsonx')
        }
    }


    async sendPrompt(prompt:string){
        try{
            const token = await this.getIamToken();

            const payload={
                messages:[
                    {
                        role:'user',
                        content:prompt,
                    }
                ],
                stream:false
            }
            const res = await axios.post(
                this.scoringUrl,
                payload,
                {
                    headers:{
                        Authorization:`Bearer ${token}`,
                        'Content-Type':'application/json',
                    },
                }
            );

            return res.data
        }
        catch(err){
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
