import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

export default function ParticlesBackground() {
  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: { enable: false },
        background: {
          color: { value: "transparent" },
        },
        fpsLimit: 60,
        detectRetina: true,
        particles: {
          number: {
            value: 14,
            density: {
              enable: true,
              area: 700,
            },
          },
          shape: {
            type: "image",
            image: [
              {
                src: "https://cdn-icons-png.flaticon.com/512/29/29302.png", // 📘 Book
                width: 40,
                height: 40,
              },
              {
                src: "https://cdn-icons-png.flaticon.com/512/919/919828.png", // 💻 Code
                width: 40,
                height: 40,
              },
              {
                src: "https://cdn-icons-png.flaticon.com/512/685/685655.png", // 📷 Camera
                width: 40,
                height: 40,
              },
              {
                src: "https://cdn-icons-png.flaticon.com/512/1170/1170678.png", // 📣 Marketing
                width: 40,
                height: 40,
              },
            ],
          },
          size: {
            value: 28,
            random: false,
          },
          opacity: {
            value: 1,
          },
          move: {
            enable: true,
            speed: 2,
            direction: "top-right",
            outModes: {
              default: "out",
            },
          },
        },
        interactivity: {
          events: {
            onHover: {
              enable: true,
              mode: "repulse",
            },
          },
          modes: {
            repulse: {
              distance: 120,
              duration: 0.6,
            },
          },
        },
      }}
    />
  );
}
