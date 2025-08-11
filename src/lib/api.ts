export class PortfolioAPI {
  private baseURL = '/api/citrea'

  async getBalance(walletAddress: string) {
    const response = await fetch(`${this.baseURL}/balance?address=${walletAddress}`)
    if (!response.ok) throw new Error('Failed to fetch balance')
    return response.json()
  }

  async getTransactions(walletAddress: string, limit = 50) {
    const response = await fetch(`${this.baseURL}/transactions?address=${walletAddress}&limit=${limit}`)
    if (!response.ok) throw new Error('Failed to fetch transactions')
    return response.json()
  }

  async getPortfolioData(walletAddress: string) {
    const response = await fetch(`${this.baseURL}/portfolio?address=${walletAddress}`)
    if (!response.ok) throw new Error('Failed to fetch portfolio')
    return response.json()
  }
}