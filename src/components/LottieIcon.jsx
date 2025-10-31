import Lottie from 'lottie-react';

// Animated Icons Component menggunakan Lottie
const LottieIcon = ({ animationData, className = "w-8 h-8", loop = true, autoplay = true, speed = 1 }) => {
  return (
    <div className={className}>
      <Lottie
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        speed={speed}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default LottieIcon;

