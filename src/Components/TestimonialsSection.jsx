// src/components/TestimonialsSection.jsx
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { FaStar } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      const snapshot = await getDocs(collection(db, "testimonials"));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setTestimonials(data);
    };

    fetchTestimonials();
  }, []);

  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16 px-4 md:px-10">
      <h2 className="text-3xl font-bold text-center mb-10">What Our Students Say</h2>

      <Swiper
        modules={[Pagination, Autoplay]}
        spaceBetween={30}
        slidesPerView={1}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        breakpoints={{
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
      >
        {testimonials.map((t, index) => (
          <SwiperSlide key={index}>
            <div className="bg-gray-800 rounded-2xl shadow-xl p-6 h-full flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={t.photoUrl || "https://via.placeholder.com/80"}
                  alt={t.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white"
                />
                <div>
                  <p className="font-semibold text-lg">{t.name}</p>
                  <p className="text-sm text-gray-400">{t.courseName}</p>
                </div>
              </div>
              <p className="italic text-gray-300 mb-4 flex-grow">"{t.review}"</p>
              <div className="flex text-yellow-400 mt-2">
                {[...Array(t.rating)].map((_, i) => (
                  <FaStar key={i} />
                ))}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

