import type { DefaultSession } from "next-auth"
import type {DefaultJWT} from "@auth/core/jwt";

declare module "next-auth" {

    // Extend session to hold the access_token
    interface Session extends DefaultSession {
        access_token?: string; // Optional string
      }
    
      interface JWT extends DefaultJWT {
        accessToken?: string; // Optional string
    }
}
