import { evolutionApi } from './evolution-api';

interface WhatsAppMessage {
  to: string;
  template?: {
    name: string;
    language: {
      code: string;
    };
    components?: Array<{
      type: string;
      parameters: Array<{
        type: string;
        text?: string;
      }>;
    }>;
  };
  text?: {
    body: string;
  };
}

class WhatsAppService {
  private evolutionApi: any;

  constructor() {
    this.evolutionApi = evolutionApi;
  }

  async createGroup(name: string, participants: string[]) {
    try {
      const response = await this.evolutionApi.createGroup(name, participants);
      return response.groupId;
    } catch (error) {
      console.error('Erro ao criar grupo:', error);
      throw error;
    }
  }

  async addParticipantToGroup(groupId: string, participant: string) {
    try {
      await this.evolutionApi.addParticipantToGroup(groupId, participant);
    } catch (error) {
      console.error('Erro ao adicionar participante:', error);
      throw error;
    }
  }

  async sendMessage(to: string, message: string) {
    try {
      await this.evolutionApi.sendMessage(to, message);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  }

  async getGroupInfo(groupId: string) {
    try {
      return await this.evolutionApi.getGroupInfo(groupId);
    } catch (error) {
      console.error('Erro ao obter informações do grupo:', error);
      throw error;
    }
  }

  async sendGroupInvite(phone: string, communityName: string) {
    const message: WhatsAppMessage = {
      to: phone,
      template: {
        name: 'community_invite',
        language: {
          code: 'pt_BR',
        },
        components: [
          {
            type: 'body',
            parameters: [
              {
                type: 'text',
                text: communityName,
              },
            ],
          },
        ],
      },
    };

    try {
      await this.evolutionApi.sendMessage(phone, JSON.stringify(message));
    } catch (error) {
      console.error('Erro ao enviar convite:', error);
      throw error;
    }
  }
}

export const whatsappService = new WhatsAppService();
