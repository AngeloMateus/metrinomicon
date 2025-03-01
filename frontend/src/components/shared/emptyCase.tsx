import Image from "next/image";

interface EmptyCaseProps {
  size?: number;
  imagePath?: EmptyCaseImage;
  label: string;
}

type EmptyCaseImage = "/empty1.svg" | "/empty2.svg" | "/empty3.svg";

const EmptyCase = ({ size = 135, label, imagePath = "/empty1.svg" }: EmptyCaseProps) => {
  return (
    <div className="flex flex-col gap-5 justify-center items-center">
      <Image
        className="relative drop-shadow-[0_0_0.02rem_#ffffff70]"
        src={imagePath}
        alt="Empty case image"
        width={size}
        height={size}
        priority
      />
      <p>{label}</p>
    </div>
  );
};

export default EmptyCase;
