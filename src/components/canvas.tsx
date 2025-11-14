import { useEffect, useRef } from "react";
import QRCode from "qrcode";

interface Colors {
  dark?: string;
  light?: string;
}

interface QRCodeOptions {
  type?: string;
  quality?: number;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  margin?: number;
  scale?: number;
  width?: number;
  color?: Colors;
}

interface LogoOptions {
  width?: number;
  x?: number;
  y?: number;
}

interface Logo {
  src: string;
  options?: LogoOptions;
}

interface IQRCode {
  text: string;
  options?: QRCodeOptions;
  logo?: Logo;
}

export const Canvas = <T extends HTMLCanvasElement>({
  text,
  options,
  logo,
  onLoad,
}: IQRCode & { onLoad?: () => void }) => {
  const inputRef = useRef<T>(null);

  useEffect(() => {
    if (inputRef.current) {
      QRCode.toCanvas(inputRef.current, text, options);
      onLoad?.();
    }
  }, [text]);

  return (
    <div className="relative">
      <canvas ref={inputRef} />
      {logo?.src ? (
        <img
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          src={logo.src}
          alt="logo"
          width={logo.options?.width}
          height={logo.options?.width}
        />
      ) : (
        ""
      )}
    </div>
  );
};
