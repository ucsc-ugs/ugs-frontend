import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Clock,
  Globe,
  Facebook,
  Twitter,
  Linkedin,
  Instagram
} from "lucide-react";

export default function ContactUs() {
  const navigate = useNavigate();

  const contactDetails = [
    {
      icon: Phone,
      title: "Phone",
      items: ["+94 11 2581245", "+94 11 2587239"],
      color: "from-[#012A4A] to-[#01497C]",
      bgColor: "bg-blue-50"
    },
    {
      icon: Mail,
      title: "Email",
      items: ["info@ucsc.cmb.ac.lk", "webmaster@ucsc.cmb.ac.lk"],
      color: "from-[#012A4A] to-[#01497C]",
      bgColor: "bg-purple-50"
    },
    {
      icon: MapPin,
      title: "Address",
      items: ["University of Colombo School of Computing", "35, Reid Avenue, Colombo 07", "Sri Lanka"],
      color: "from-[#012A4A] to-[#01497C]",
      bgColor: "bg-orange-50"
    },
    {
      icon: Clock,
      title: "Office Hours",
      items: ["Monday - Friday: 8:30 AM - 4:30 PM", "Saturday - Sunday: Closed"],
      color: "from-[#012A4A] to-[#01497C]",
      bgColor: "bg-green-50"
    },
    {
      icon: Globe,
      title: "Website",
      items: ["www.ucsc.cmb.ac.lk"],
      color: "from-[#012A4A] to-[#01497C]",
      bgColor: "bg-indigo-50"
    }
  ];

  const socialLinks = [
    { icon: Facebook, label: "Facebook", href: "https://www.facebook.com/UCSC.LK", color: "hover:bg-blue-600" },
    { icon: Twitter, label: "Twitter", href: "https://twitter.com/ucsc_lk", color: "hover:bg-sky-500" },
    { icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/school/ucsc-lk", color: "hover:bg-blue-700" },
    { icon: Instagram, label: "Instagram", href: "https://www.instagram.com/ucsc.lk", color: "hover:bg-pink-600" }
  ];

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-[#89C2D9]/20 to-[#01497C]/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-tr from-[#012A4A]/10 to-[#89C2D9]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 right-1/4 w-96 h-96 bg-gradient-to-tl from-[#01497C]/15 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-[#012A4A] hover:bg-[#89C2D9]/10 hover:text-[#01497C] border border-[#89C2D9]/30"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </motion.div>
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex justify-center mb-8">
              <motion.div
                className="relative"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#89C2D9]/30 to-[#01497C]/30 rounded-full blur-2xl"></div>
                <div className="relative bg-white rounded-full p-6 shadow-2xl">
                  <img
                    src="../src/assets/ucsc_logo.png"
                    alt="UCSC Logo"
                    width={120}
                    height={120}
                    className="object-contain"
                  />
                </div>
              </motion.div>
            </div>

            <motion.h1
              className="text-5xl md:text-6xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="bg-gradient-to-r from-[#012A4A] via-[#01497C] to-[#013A63] bg-clip-text text-transparent">
                Contact Us
              </span>
            </motion.h1>

            <motion.p
              className="text-xl text-gray-600 mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              University of Colombo School of Computing
            </motion.p>

            <motion.p
              className="text-base text-gray-500 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              We're here to help and answer any questions you might have. We look forward to hearing from you!
            </motion.p>

            <motion.div
              className="flex justify-center gap-3 mt-6"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="h-1 w-20 bg-gradient-to-r from-transparent via-[#01497C] to-transparent rounded-full"></div>
              <div className="h-1 w-1 bg-[#89C2D9] rounded-full"></div>
              <div className="h-1 w-20 bg-gradient-to-r from-transparent via-[#01497C] to-transparent rounded-full"></div>
            </motion.div>
          </motion.div>

          {/* Main Content Grid */}
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">

              {/* Left Column - Contact Details */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="space-y-6"
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-[#012A4A] mb-2">Get In Touch</h2>
                  <p className="text-gray-600">Feel free to reach out to us through any of the following channels</p>
                </div>

                {contactDetails.map((detail, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                  >
                    <Card className="border-l-4 border-l-transparent hover:border-l-[#01497C] shadow-md hover:shadow-xl transition-all duration-300 bg-white">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-14 h-14 rounded-xl bg-gradient-to-br ${detail.color} flex items-center justify-center flex-shrink-0 shadow-lg`}
                          >
                            <detail.icon className="h-7 w-7 text-white" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-[#012A4A] mb-2">{detail.title}</h3>
                            <div className="space-y-1">
                              {detail.items.map((item, idx) => (
                                <p key={idx} className="text-gray-600 text-sm leading-relaxed break-words">
                                  {item}
                                </p>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              {/* Right Column - Map */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="lg:sticky lg:top-8 h-fit"
              >
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-[#012A4A] mb-2">Visit Us</h2>
                  <p className="text-gray-600">Find us on the map</p>
                </div>

                <Card className="shadow-2xl border-0 overflow-hidden bg-white">
                  <CardContent className="p-0">
                    <div className="relative">
                      <div className="absolute top-4 left-4 right-4 z-10">
                        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4">
                          <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-[#01497C] flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold text-[#012A4A] text-sm">UCSC - Reid Avenue</p>
                              <p className="text-xs text-gray-600">35, Reid Avenue, Colombo 07</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="w-full h-[700px]">
                        <iframe
                          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.798994119244!2d79.86137931477275!3d6.914681995007146!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae25963120cb839%3A0x8b2f3b7c4f4a4f4a!2sUniversity%20of%20Colombo%20School%20of%20Computing!5e0!3m2!1sen!2slk!4v1234567890123!5m2!1sen!2slk"
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title="UCSC Location Map"
                        ></iframe>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Social Media & Quick Links Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50 overflow-hidden">
                <CardContent className="p-10">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-[#012A4A] mb-3">Stay Connected</h2>
                    <p className="text-gray-600">Follow us on social media for the latest updates and news</p>
                  </div>

                  {/* Social Media Icons */}
                  <div className="flex justify-center gap-4 mb-10">
                    {socialLinks.map((social, index) => (
                      <motion.a
                        key={index}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group relative w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-700 ${social.color} hover:text-white transition-all duration-300 shadow-lg hover:shadow-2xl overflow-hidden`}
                        whileHover={{ scale: 1.15, y: -8 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <social.icon className="h-7 w-7 relative z-10" />
                      </motion.a>
                    ))}
                  </div>

                  {/* Quick Action Button */}
                  <div className="flex flex-col items-center gap-6 pt-8 border-t border-gray-200">
                    <div className="text-center">
                      <p className="text-gray-600 mb-4">For more information about admissions, programs, and services</p>
                      <motion.a
                        href="https://www.ucsc.cmb.ac.lk"
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button className="bg-gradient-to-r from-[#01497C] to-[#013A63] hover:from-[#012A4A] hover:to-[#01497C] text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                          <Globe className="mr-2 h-5 w-5" />
                          Visit Our Official Website
                        </Button>
                      </motion.a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="bg-gradient-to-r from-[#012A4A] via-[#01497C] to-[#013A63] py-8 mt-16"
        >
          <div className="container mx-auto px-4 text-center">
            <p className="text-white/90 text-sm">
              &copy; {new Date().getFullYear()} University of Colombo School of Computing. All rights reserved.
            </p>
            <p className="text-white/70 text-xs mt-2">
              Empowering minds, shaping the future of technology
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

