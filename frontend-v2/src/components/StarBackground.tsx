"use client";
import React, { useEffect, useState } from 'react';

const generateStars = (count: number) => {
  let stars = "";
  for (let i = 0; i < count; i++) {
    stars += `${Math.floor(Math.random() * 4000)}px ${Math.floor(Math.random() * 4000)}px #FFF${i < count - 1 ? ", " : ""}`;
  }
  return stars;
};

export const StarBackground = () => {
  const [shadows, setShadows] = useState({ s1: "", s2: "", s3: "" });

  useEffect(() => {
    setShadows({
      s1: generateStars(700),
      s2: generateStars(200),
      s3: generateStars(100),
    });
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#090a0f]">
      <div id="stars" className="absolute w-[1px] h-[1px] bg-transparent animate-[animStar_50s_linear_infinite]" style={{ boxShadow: shadows.s1 }} />
      <div id="stars2" className="absolute w-[2px] h-[2px] bg-transparent animate-[animStar_100s_linear_infinite]" style={{ boxShadow: shadows.s2 }} />
      <div id="stars3" className="absolute w-[3px] h-[3px] bg-transparent animate-[animStar_150s_linear_infinite]" style={{ boxShadow: shadows.s3 }} />
    </div>
  );
};
