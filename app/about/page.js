import Image from "next/image"; // Keep for potential future images

// Placeholder: You might want to add new, relevant images later
// import imagePlaceholder1 from "@/public/gym-placeholder-1.jpg"; 
// import imagePlaceholder2 from "@/public/gym-placeholder-2.jpg";

export const metadata = {
  title: "About GymFlex", // Updated title
};

export default function Page() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-lg">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-accent-500 mb-6">
          About GymFlex
        </h1>
        <p className="text-xl text-primary-300">
          Your ultimate platform for discovering and managing gym memberships.
        </p>
      </div>

      <div className="space-y-8 text-primary-200 leading-relaxed">
        <section>
          <h2 className="text-3xl font-semibold text-accent-400 mb-4">Our Mission</h2>
          <p>
            At GymFlex, our mission is to connect fitness enthusiasts with the best gyms and studios in their area. We aim to provide a seamless experience for users to find, compare, and access a wide variety of fitness options, while empowering gyms to reach a broader audience and manage their memberships efficiently.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-semibold text-accent-400 mb-4">For Fitness Seekers</h2>
          <p>
            Discover a diverse range of gyms, from local favorites to specialized studios. Explore detailed profiles, view membership plans, and find the perfect fit for your fitness goals and lifestyle. With GymFlex, your next workout is just a few clicks away.
          </p>
        </section>
        
        <section>
          <h2 className="text-3xl font-semibold text-accent-400 mb-4">For Gym Owners</h2>
          <p>
            Showcase your gym to a vibrant community of fitness seekers. Manage your profile, list your unique membership offerings, handle new member orders, and engage with your clients through event postings. GymFlex provides the tools you need to grow your business and connect with your members.
          </p>
        </section>

        {/* Placeholder for future image sections if needed */}
        {/* 
        <div className="grid md:grid-cols-2 gap-8 items-center my-12">
          <div>
            <Image src={imagePlaceholder1} alt="Modern gym interior" className="rounded-lg shadow-lg" />
          </div>
          <p>
            We believe in making fitness accessible and enjoyable for everyone. Our platform is designed with both users and gym owners in mind, fostering a community built on health and wellness.
          </p>
        </div>
        */}

        <section className="text-center mt-12">
          <p className="text-2xl font-semibold text-primary-100">
            Join the GymFlex community today!
          </p>
          {/* Optional: Link to signup or gyms page */}
          {/* 
          <a
            href="/gyms" // Or "/signup"
            className="inline-block mt-6 bg-accent-500 px-8 py-4 text-primary-800 text-lg font-semibold rounded-md hover:bg-accent-600 transition-all"
          >
            Explore Gyms
          </a>
          */}
        </section>
      </div>
    </div>
  );
}
