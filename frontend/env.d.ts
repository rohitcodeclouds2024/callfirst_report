declare namespace NodeJS {
  interface ProcessEnv {
    
    NEXTAUTH_SECRET: string;

   
	  BACKEND_LOGIN_URL: string;
	  NEXTAUTH_URL: string;

   
    EMAIL_SERVER?: string;
    EMAIL_FROM?: string;
  }
}
