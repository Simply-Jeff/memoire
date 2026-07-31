"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, ArrowRight, Sparkles, BookOpen, Link } from "lucide-react";

export function OnboardingWizard() {
  const [step, setStep] = useState(0);

  const steps = [
    {
      icon: <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />,
      title: "Welcome to memoire.",
      description: "Your new personal thought space. Let's get you set up in less than a minute."
    },
    {
      icon: <Link className="h-12 w-12 text-blue-500 mx-auto mb-4" />,
      title: "Save Anything.",
      description: "Paste a URL for a video, article, tweet, or product. We'll instantly grab the images, text, and metadata."
    },
    {
      icon: <BookOpen className="h-12 w-12 text-green-500 mx-auto mb-4" />,
      title: "Read Anywhere.",
      description: "We automatically parse articles into a beautiful distraction-free reader mode and save them for offline access."
    }
  ];

  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-lg p-8 relative overflow-hidden text-center shadow-lg border-primary/20">
        <div className="absolute top-0 left-0 w-full h-1 bg-muted">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: `${((step + 1) / (steps.length + 1)) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <AnimatePresence mode="wait">
          {step < steps.length ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="py-6"
            >
              {steps[step].icon}
              <h2 className="text-2xl font-bold mb-3">{steps[step].title}</h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-sm mx-auto">
                {steps[step].description}
              </p>
              <Button size="lg" onClick={() => setStep(step + 1)} className="group">
                Next <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="final"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-6"
            >
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plus className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-3">You're all set!</h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-sm mx-auto">
                Click the + button in the bottom right corner to add your very first bookmark.
              </p>
              <Button size="lg" onClick={() => {
                document.querySelector<HTMLButtonElement>('button[data-slot="dialog-trigger"]')?.click();
              }}>
                Add your first link
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}
