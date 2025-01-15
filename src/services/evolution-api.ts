import { EXPO_PUBLIC_EVOLUTION_API_URL, EXPO_PUBLIC_EVOLUTION_API_KEY } from '@env';

interface EvolutionApiConfig {
  baseUrl: string;
  apiKey: string;
  instanceName: string;
}

class EvolutionApiService {
  private baseUrl: string;
  private apiKey: string;
  private instanceName: string;

  constructor(config: EvolutionApiConfig) {
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
    this.instanceName = config.instanceName;
  }

  private async request(endpoint: string, method: string = 'GET', body?: any) {
    try {
      const response = await fetch(`${this.baseUrl}/${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro na requisição');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Evolution API Error:', error);
      throw new Error(`Evolution API Error: ${error.message}`);
    }
  }

  async createInstance() {
    return this.request(`instance/create`, 'POST', {
      instanceName: this.instanceName,
      qrcode: true,
      number: '',
      token: '',
    });
  }

  async getQrCode() {
    return this.request(`instance/qrcode/${this.instanceName}`);
  }

  async getInstanceStatus() {
    return this.request(`instance/connectionState/${this.instanceName}`);
  }

  async sendMessage(to: string, message: string) {
    return this.request(`message/text/${this.instanceName}`, 'POST', {
      number: to,
      options: {
        delay: 1200,
        presence: 'composing',
      },
      textMessage: {
        text: message,
      },
    });
  }

  async createGroup(name: string, participants: string[]) {
    return this.request(`group/create/${this.instanceName}`, 'POST', {
      name,
      participants: participants.map(number => number.replace(/\D/g, '')),
    });
  }

  async addParticipantToGroup(groupId: string, participant: string) {
    return this.request(`group/add-participant/${this.instanceName}`, 'POST', {
      groupId,
      participant: participant.replace(/\D/g, ''),
    });
  }

  async removeParticipantFromGroup(groupId: string, participant: string) {
    return this.request(`group/remove-participant/${this.instanceName}`, 'POST', {
      groupId,
      participant: participant.replace(/\D/g, ''),
    });
  }

  async promoteParticipant(groupId: string, participant: string) {
    return this.request(`group/promote-participant/${this.instanceName}`, 'POST', {
      groupId,
      participant: participant.replace(/\D/g, ''),
    });
  }

  async demoteParticipant(groupId: string, participant: string) {
    return this.request(`group/demote-participant/${this.instanceName}`, 'POST', {
      groupId,
      participant: participant.replace(/\D/g, ''),
    });
  }

  async getGroupInfo(groupId: string) {
    return this.request(`group/info/${this.instanceName}/${groupId}`);
  }

  async getAllGroups() {
    return this.request(`group/list/${this.instanceName}`);
  }
}

// Criar instância do serviço
const evolutionApi = new EvolutionApiService({
  baseUrl: EXPO_PUBLIC_EVOLUTION_API_URL,
  apiKey: EXPO_PUBLIC_EVOLUTION_API_KEY,
  instanceName: 'domatch', // Nome da instância para o app
});

export { evolutionApi };
