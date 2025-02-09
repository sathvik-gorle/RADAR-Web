"use client"

import MapsLogo from "@/assets/mapslogo.png";
import GithubLogo from "@/assets/githublogo.png";
import NASALogo from "@/assets/nasalogo.png";
import TensorLogo from "@/assets/tensorlogo.png";
import SenintelLogo from "@/assets/sentinellogo.jpg";
import Image from "next/image";
import { motion } from "framer-motion";

export function LogoTicker() {
  return (
    <>
      <section className={"py-20 md:py-24"}>
        <div className={"container"}>
          <div className={"flex items-center gap-5"}>
              <div className={"flex-1 md:flex-none"}>
                  <h2 className={""}>Utilizing: </h2>
              </div>
              <div className={"flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]"}>
                  <motion.div
                      initial={{translateX: '-50%'}}
                      animate={{translateX: '0'}}
                      transition={{
                          repeat: Infinity,
                          duration: 30,
                          ease: "linear",
                      }}
                      className={"flex flex-none gap-14 pr-14 -translate-x-1/2"}>
                      {[MapsLogo, GithubLogo, NASALogo, TensorLogo, SenintelLogo, MapsLogo, GithubLogo, NASALogo, TensorLogo, SenintelLogo].map((logo, index) => (
                          <Image src={logo} alt={`${logo}`} key={index} className={"h-6 w-auto"}/>
                      ))}
                  </motion.div>
              </div>
          </div>
        </div>
      </section>
    </>
  );
}
