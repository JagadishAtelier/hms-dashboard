import Lottie from "lottie-react";
import hospitalAnimation from "../assets/hospital.json";

const Loading = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-64 h-64">
        <Lottie animationData={hospitalAnimation} loop={true} />
      </div>
    </div>
  );
};

export default Loading;