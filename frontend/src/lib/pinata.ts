import { PinataSDK } from "pinata";
import { envPINATA_JWT, envNEXT_PUBLIC_GATEWAY_URL } from './env';

// Singleton implementation for Pinata SDK
class PinataInstance {
  private static instance: PinataSDK | null = null;

  public static getInstance(): PinataSDK {
    if (!PinataInstance.instance) {
      PinataInstance.instance = new PinataSDK({
        pinataJwt: envPINATA_JWT,
        pinataGateway: envNEXT_PUBLIC_GATEWAY_URL
      });
    }
    return PinataInstance.instance;
  }
}

export const pinata = PinataInstance.getInstance(); 