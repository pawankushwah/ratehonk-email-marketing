"use client";

import { useFormik } from "formik";
import { z } from "zod";
import { trpc } from "@/app/trpc";
import { useToast } from "@/app/hooks/useToast";
import Button from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";

const contactSchema = z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email address"),
    subject: z.string().optional(),
    message: z.string().min(10, "Message must be at least 10 characters"),
});

const validateWithZod = (schema: z.ZodSchema) => (values: any) => {
    try {
        schema.parse(values);
        return {};
    } catch (error) {
        if (error instanceof z.ZodError) {
            return error.formErrors.fieldErrors;
        }
        return {};
    }
};

type ContactFormValues = z.infer<typeof contactSchema>;

import { Mail, MessageSquare, Phone, Send } from "lucide-react";

export default function ContactPage() {
    const { addToast } = useToast();

    const contactMutation = trpc.contact.submit.useMutation({
        onSuccess: () => {
            addToast("Thank you for contacting us! We will get back to you soon.", "success");
            formik.resetForm();
        },
        onError: (err) => {
            addToast(err.message || "Failed to send message. Please try again.", "error");
        }
    });

    const formik = useFormik<ContactFormValues>({
        initialValues: {
            name: "",
            email: "",
            subject: "",
            message: "",
        },
        validate: validateWithZod(contactSchema),
        onSubmit: (values) => {
            contactMutation.mutate(values);
        },
    });

    return (
        <div className="flex min-h-[calc(100vh-80px)] w-full justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50/50 overflow-hidden relative">
            <div className="relative w-full max-w-[480px]">
                {/* Background Decorative Elements */}
                <div className="absolute -top-12 -left-10 md:-left-16 animate-[bounce_4s_infinite] opacity-40 z-0">
                    <div className="bg-blue-100 p-4 rounded-full shadow-md">
                        <Mail className="w-8 h-8 text-blue-500" />
                    </div>
                </div>

                <div className="absolute -bottom-10 -left-8 md:-left-20 animate-[bounce_5s_infinite_reverse] opacity-40 hidden sm:block z-0">
                    <div className="bg-green-100 p-4 rounded-full shadow-md">
                        <MessageSquare className="w-8 h-8 text-green-500" />
                    </div>
                </div>

                <div className="absolute top-24 -right-10 md:-right-16 animate-[bounce_6s_infinite] opacity-40 hidden md:block z-0">
                    <div className="bg-purple-100 p-4 rounded-full shadow-md">
                        <Send className="w-8 h-8 text-purple-500" />
                    </div>
                </div>

                <div className="absolute -bottom-6 -right-8 md:-right-16 animate-[bounce_4.5s_infinite_reverse] opacity-40 z-0">
                    <div className="bg-yellow-100 p-4 rounded-full shadow-md">
                        <Phone className="w-8 h-8 text-yellow-500" />
                    </div>
                </div>

                {/* Form Container */}
                <div className="relative z-10 w-full space-y-8 bg-white/90 backdrop-blur-sm p-10 rounded-2xl">
                    <div>
                        <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
                            Get in Touch
                        </h2>
                        <p className="mt-4 text-center text-sm text-gray-500 font-oxygen max-w-sm mx-auto leading-relaxed">
                            Have questions about RateHonk? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit} noValidate>
                        <div className="space-y-5">
                            <Input
                                name="name"
                                label="Full Name"
                                type="text"
                                required
                                placeholder="e.g. Jane Doe"
                                value={formik.values.name}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.name && formik.errors.name ? String(formik.errors.name[0] || formik.errors.name) : undefined}
                            />

                            <Input
                                name="email"
                                label="Email Address"
                                type="email"
                                required
                                placeholder="e.g. jane@example.com"
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.email && formik.errors.email ? String(formik.errors.email[0] || formik.errors.email) : undefined}
                            />

                            <Input
                                name="subject"
                                label="Subject (Optional)"
                                type="text"
                                placeholder="e.g. Question about billing"
                                value={formik.values.subject}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.subject && formik.errors.subject ? String(formik.errors.subject[0] || formik.errors.subject) : undefined}
                            />

                            <div className="flex flex-col space-y-2">
                                <label className="text-sm font-semibold text-text">
                                    Message <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="message"
                                    required
                                    rows={5}
                                    placeholder="Write your message here..."
                                    className={`${formik.touched.message && formik.errors.message ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-main hover:border-gray-300'} flex w-full rounded-lg border bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all font-oxygen`}
                                    value={formik.values.message}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                                {formik.touched.message && formik.errors.message && (
                                    <p className="text-red-500 text-xs font-semibold">
                                        {String(formik.errors.message[0] || formik.errors.message)}
                                    </p>
                                )}
                            </div>
                        </div>

                        <Button type="submit" disabled={contactMutation.isPending} className="w-full mt-2">
                            {contactMutation.isPending ? "Sending Message..." : "Send Message"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}