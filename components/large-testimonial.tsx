import Image from "next/image";
import TestimonialImg from "@/public/images/large-testimonial.jpg";

export default function LargeTestimonial() {
  return (
    <section>
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="py-12 md:py-20">
          <div className="space-y-3 text-center">
            <div className="relative inline-flex">
              <svg
                className="absolute -left-6 -top-2 -z-10"
                width={40}
                height={49}
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
            <p className="text-xl font-bold text-gray-900 leading-relaxed md:text-2xl">
              « Névé a totalement changé mes week-ends. Plus besoin de louer de voiture ni de passer des heures à synchroniser les TER et les bus. Je choisis ma rando, j'achète mes billets en 1 clic sur Trainline et je pars l'esprit tranquille grâce à l'alerte sécurité retour. »
            </p>
            <div className="text-sm font-medium text-gray-500">
              <span className="text-gray-700">Maxime, 26 ans (Lyon)</span>{" "}
              <span className="text-gray-400">/</span>{" "}
              <span className="text-[color:var(--color-brand-orange)] font-semibold">
                Randonneur sans voiture
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
