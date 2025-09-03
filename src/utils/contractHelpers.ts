import Web3 from 'web3';
import { cropAdvisorABI, cropAdvisorAddress } from '../contracts/contractConfig';

export class ContractHelper {
  private web3: Web3;
  private contract: any;
  private account: string;

  constructor(web3: Web3, account: string) {
    this.web3 = web3;
    this.account = account;
    this.contract = new web3.eth.Contract(cropAdvisorABI, cropAdvisorAddress);
  }

  async getAnalysisPrice(): Promise<string> {
    try {
      const price = await this.contract.methods.analysisPrice().call();
      return price;
    } catch (error) {
      console.error('Failed to get analysis price:', error);
      throw new Error('Could not retrieve analysis price');
    }
  }

  async requestAnalysis(imageHash: string): Promise<string> {
    try {
      const price = await this.getAnalysisPrice();
      
      const transaction = await this.contract.methods.requestAnalysis(imageHash).send({
        from: this.account,
        value: price,
        gas: '300000'
      });

      const events = transaction.events;
      const paymentEvent = events?.PaymentReceived;
      
      if (paymentEvent && paymentEvent.returnValues) {
        return paymentEvent.returnValues.analysisId;
      }
      
      throw new Error('Failed to get analysis ID from transaction');
    } catch (error) {
      console.error('Analysis request failed:', error);
      throw error;
    }
  }

  async getAnalysis(analysisId: string): Promise<any> {
    try {
      const analysis = await this.contract.methods.getAnalysis(analysisId).call();
      return analysis;
    } catch (error) {
      console.error('Failed to get analysis:', error);
      throw new Error('Could not retrieve analysis data');
    }
  }

  async getFarmerAnalyses(): Promise<string[]> {
    try {
      const analyses = await this.contract.methods.getFarmerAnalyses(this.account).call();
      return analyses;
    } catch (error) {
      console.error('Failed to get farmer analyses:', error);
      return [];
    }
  }
}