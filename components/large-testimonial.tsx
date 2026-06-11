import Image from "next/image";
import TestimonialImg from "@/public/images/large-testimonial.jpg";

export default function LargeTestimonial() {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-6 sm:px-10 md:px-16">
        <div className="py-20 md:py-40">
          <div className="space-y-3 text-center">
            <div className="relative inline-flex">
              <svg
                className="absolute -z-10 left-[-29px] top-[-14.5px] w-[40px] h-[49px]"
                viewBox="0 0 40 49"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.7976 -0.000136375L39.9352 23.4746L33.4178 31.7234L13.7686 11.4275L22.7976 -0.000136375ZM9.34947 17.0206L26.4871 40.4953L19.9697 48.7441L0.320491 28.4482L9.34947 17.0206Z"
                  fill="#D1D5DB"
                />
              </svg>
              <Image
                className="rounded-full"
                src={TestimonialImg}
                width={48}
                height={48}
                alt="Large testimonial"
              />
            </div>
            <p 
              className="font-bricolage font-bold text-2xl tracking-[-0.888px] text-[#292929] leading-[39px] text-center"
              style={{ fontVariationSettings: "'opsz' 14, 'wdth' 100" }}
            >
              « Névé a totalement changé mes week-ends. Plus besoin de louer de voiture ni de passer des heures à synchroniser les TER et les bus. Je choisis ma rando, j'achète mes billets en 1 clic sur Trainline et je pars l'esprit tranquille grâce à l'alerte sécurité retour. »
            </p>
            <div 
              className="font-satoshi text-[18px] font-medium text-[#525252] tracking-[-0.4px] text-center leading-[22px]"
            >
              <span>Mathilde, 26 ans (Lyon)</span>
              <span className="text-[#bdbdbd]"> / </span>
              <span className="font-semibold text-[#eb490b]">
                Randonneuse sans voiture
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
