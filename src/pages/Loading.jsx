import loading from "../assets/loading.gif";
const Loading = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <img src={loading} alt="loading" height={220} width={220}/>
    </div>
  );
};

export default Loading;