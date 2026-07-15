declare module "qrcode" {
  interface ToStringOptions {
    type?: "svg" | "utf8" | "terminal";
    margin?: number;
    color?: {
      dark?: string;
      light?: string;
    };
  }

  const QRCode: {
    toString(text: string, opts?: ToStringOptions): Promise<string>;
  };

  export default QRCode;
}
