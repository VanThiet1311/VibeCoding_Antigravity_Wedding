import React from "react";
import dbConnect from "@/lib/db";
import Wedding from "@/models/Wedding";
import Ceremony from "@/models/Ceremony";
import { notFound } from "next/navigation";
import GuestLayout from "@/components/layout/GuestLayout";
import { Calendar, MapPin, Clock, Heart, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Props {
    params: {
        slug: string;
    };
}

export default async function PublicWeddingPage({ params }: Props) {
    const { slug } = params;

    await dbConnect();
    const wedding = await Wedding.findOne({ slug }).lean();

    if (!wedding) {
        notFound();
    }

    const ceremonies = await Ceremony.find({ weddingId: wedding._id }).sort({ date: 1 }).lean();

    return (
        <GuestLayout>
            <div className="max-w-4xl mx-auto px-4 py-12 space-y-16">
                {/* Hero section */}
                <div className="text-center space-y-6">
                    <div className="inline-block p-2 px-4 bg-rose-50 rounded-full text-rose-600 text-sm font-bold tracking-widest uppercase">
                        Trân trọng kính mời
                    </div>
                    <h1 className="text-5xl md:text-7xl font-serif font-bold text-gray-900">
                        {wedding.groomName} <span className="text-rose-600">&</span> {wedding.brideName}
                    </h1>
                    <p className="text-xl text-gray-500 font-serif italic">
                        Chúng mình chuẩn bị về chung một nhà...
                    </p>
                </div>

                {/* Wedding Date Display */}
                <div className="flex flex-col items-center gap-4 bg-white p-10 rounded-[3rem] shadow-soft border border-rose-100">
                    <div className="flex items-center gap-8 md:gap-16">
                        <div className="text-center">
                            <p className="text-sm uppercase tracking-[0.3em] text-gray-400 font-bold mb-2">Tháng</p>
                            <p className="text-3xl font-serif font-bold text-gray-900">
                                {new Date(wedding.weddingDate).getMonth() + 1}
                            </p>
                        </div>
                        <div className="h-16 w-px bg-rose-200" />
                        <div className="text-center">
                            <p className="text-sm uppercase tracking-[0.3em] text-rose-500 font-bold mb-2">Ngày</p>
                            <p className="text-5xl font-serif font-bold text-gray-900">
                                {new Date(wedding.weddingDate).getDate()}
                            </p>
                        </div>
                        <div className="h-16 w-px bg-rose-200" />
                        <div className="text-center">
                            <p className="text-sm uppercase tracking-[0.3em] text-gray-400 font-bold mb-2">Năm</p>
                            <p className="text-3xl font-serif font-bold text-gray-900">
                                {new Date(wedding.weddingDate).getFullYear()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Ceremonies details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {ceremonies.map((ceremony: any) => (
                        <div key={ceremony._id.toString()} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-rose-50 space-y-6 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <h3 className="text-2xl font-serif font-bold text-gray-900">{ceremony.name}</h3>
                                <div className="p-3 bg-rose-50 rounded-2xl text-rose-600">
                                    <Clock size={24} />
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Clock className="text-rose-400" size={18} />
                                    <span className="font-medium">{ceremony.startTime}</span>
                                </div>
                                <div className="flex items-start gap-3 text-gray-600">
                                    <MapPin className="text-rose-400 mt-1 shrink-0" size={18} />
                                    <div>
                                        <p className="font-bold text-gray-900">{ceremony.locationName}</p>
                                        <p className="text-sm text-gray-500 leading-relaxed">{ceremony.addressDetail}</p>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full py-3 bg-rose-50 text-rose-600 rounded-2xl font-bold text-sm hover:bg-rose-100 transition-colors">
                                Xem bản đồ
                            </button>
                        </div>
                    ))}
                </div>

                {/* Call to action for guests */}
                <div className="bg-rose-600 p-12 rounded-[3.5rem] text-white text-center space-y-8 shadow-xl relative overflow-hidden">
                    <div className="relative z-10 space-y-4">
                        <Heart className="w-12 h-12 mx-auto mb-4 animate-pulse opacity-80" />
                        <h2 className="text-3xl font-serif font-bold">Dành cho Khách Mời</h2>
                        <p className="text-rose-100 max-w-md mx-auto">
                            Nếu bạn có mã mời kỹ thuật số, hãy nhấn nút dưới đây để truy cập trang cá nhân của mình.
                        </p>
                        <div className="pt-4">
                            <Link 
                                href="/" 
                                className="inline-flex items-center gap-2 bg-white text-rose-600 px-10 py-4 rounded-full font-bold shadow-lg hover:scale-105 transition-all group"
                            >
                                Truy cập Guest Portal
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                    {/* Decorative background circle */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-20 -mb-20 blur-3xl" />
                </div>
            </div>
        </GuestLayout>
    );
}
