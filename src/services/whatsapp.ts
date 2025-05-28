import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

class WhatsAppService {
    private client: Client;
    private static instance: WhatsAppService;
    private qrCode: string | null = null;
    private isInitialized: boolean = false;
    private initializationPromise: Promise<void> | null = null;
    private lastError: string | null = null;

    private constructor() {
        this.client = new Client({
            authStrategy: new LocalAuth(),
            puppeteer: {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu'
                ]
            }
        });

        this.initializationPromise = this.initialize();
    }

    public static getInstance(): WhatsAppService {
        if (!WhatsAppService.instance) {
            WhatsAppService.instance = new WhatsAppService();
        }
        return WhatsAppService.instance;
    }

    private async initialize(): Promise<void> {
        if (this.isInitialized) return;

        console.log('Initializing WhatsApp client...');

        this.client.on('qr', (qr: string) => {
            console.log('QR Code received, generating display...');
            this.qrCode = qr;
            qrcode.generate(qr, { small: true });
            console.log('Please scan the QR code above with your WhatsApp mobile app');
        });

        this.client.on('loading_screen', (percent: string, message: string) => {
            console.log('Loading:', percent, '%', message);
        });

        this.client.on('authenticated', () => {
            console.log('WhatsApp client is authenticated!');
            this.qrCode = null;
            this.lastError = null;
        });

        this.client.on('auth_failure', (msg: string) => {
            console.error('Authentication failed:', msg);
            this.qrCode = null;
            this.lastError = `Authentication failed: ${msg}`;
            throw new Error(this.lastError);
        });

        this.client.on('disconnected', (reason: string) => {
            console.error('WhatsApp client disconnected:', reason);
            this.isInitialized = false;
            this.lastError = `Disconnected: ${reason}`;
            throw new Error(this.lastError);
        });

        this.client.on('ready', () => {
            console.log('WhatsApp client is ready!');
            this.isInitialized = true;
            this.lastError = null;
        });

        this.client.on('message', async (message) => {
            console.log('Message received:', message.body);
        });

        try {
            await this.client.initialize();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error';
            console.error('Failed to initialize WhatsApp client:', errorMessage);
            this.lastError = `Initialization failed: ${errorMessage}`;
            throw new Error(this.lastError);
        }
    }

    public async getQRCode(): Promise<string | null> {
        if (!this.isInitialized && this.initializationPromise) {
            await this.initializationPromise;
        }
        return this.qrCode;
    }

    public async sendMessage(to: string, message: string) {
        if (!this.isInitialized && this.initializationPromise) {
            try {
                await this.initializationPromise;
            } catch (error) {
                throw new Error('WhatsApp client not initialized properly');
            }
        }

        if (!this.isInitialized) {
            throw new Error('WhatsApp client is not initialized');
        }

        try {
            const formattedNumber = to.includes('@c.us') ? to : `${to}@c.us`;
            await this.client.sendMessage(formattedNumber, message);
            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error sending message:', errorMessage);
            this.lastError = `Message sending failed: ${errorMessage}`;
            return false;
        }
    }

    public async getChats() {
        if (!this.isInitialized && this.initializationPromise) {
            await this.initializationPromise;
        }

        try {
            const chats = await this.client.getChats();
            return chats;
        } catch (error) {
            console.error('Error getting chats:', error);
            return [];
        }
    }

    public getLastError(): string | null {
        return this.lastError;
    }

    public isReady(): boolean {
        return this.isInitialized;
    }
}

export default WhatsAppService; 