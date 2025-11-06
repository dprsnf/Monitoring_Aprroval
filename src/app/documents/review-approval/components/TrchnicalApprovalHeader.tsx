"use client";
import { ChevronLeft, ArrowLeft, ChevronDown, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VendorData } from "@/app/types/technicalApproval";
import router from "next/router";

interface TechnicalApprovalHeaderProps {
    selectedVendor: VendorData | null;
    onBackToVendors: () => void;
}

export default function TechnicalApprovalHeader({ selectedVendor, onBackToVendors }: TechnicalApprovalHeaderProps) {
    return (
        <header className="bg-gradient-to-r from-[#125d72] to-[#14a2ba] shadow-lg">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
                <div className="flex items-center justify-between h-14 sm:h-16">
                    <div className="flex items-center gap-1 sm:gap-2 lg:gap-4 min-w-0 flex-1">
                            <Button 
                            onClick={() => router.push("/")}
                            className="bg-[#efe62f] hover:bg-[#125d72] text-gray-900 hover:text-white transition-all duration-200">
                                <ChevronLeft/>
                            </Button>
                        
                        {selectedVendor && (
                            <Button 
                                onClick={onBackToVendors}
                                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm"
                            >
                                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">Back</span>
                            </Button>
                        )}
                        
                        <div className="h-6 sm:h-8 w-px bg-white/30 mx-1 sm:mx-2"></div>
                        
                        <div className="min-w-0 flex-1">
                            <h1 className="text-xs sm:text-sm lg:text-xl font-semibold text-white truncate">
                                {selectedVendor ? (
                                    <>
                                        <span className="block sm:hidden">{selectedVendor.user.name}</span>
                                        <span className="hidden sm:block lg:hidden">{selectedVendor.user.name} - Docs</span>
                                        <span className="hidden lg:block">{selectedVendor.user.name} - Documents</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="block sm:hidden">Approval</span>
                                        <span className="hidden sm:block lg:hidden">Technical Approval</span>
                                        <span className="hidden lg:block">Technical Approval System</span>
                                    </>
                                )}
                            </h1>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button className="bg-[#efe62f] hover:bg-[#125d72] text-gray-900 hover:text-white transition-all duration-200 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg">
                                    <span className="text-xs sm:text-sm font-medium mr-1">User</span>
                                    <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 sm:w-56 bg-white border border-gray-100 shadow-xl rounded-lg">
                                <DropdownMenuLabel className="bg-gradient-to-r from-[#125d72]/10 to-[#14a2ba]/10 rounded-t-lg">
                                    <div className="py-1">
                                        <p className="text-sm font-semibold text-gray-900">Technical Team</p>
                                        <p className="text-xs text-[#14a2ba]">technical@pln.co.id</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-gray-100" />
                                <DropdownMenuItem className="hover:bg-red-50 cursor-pointer transition-all duration-200 focus:bg-red-100 mx-1 my-1 rounded-md">
                                    <LogOut className="mr-2 h-4 w-4 text-red-600" />
                                    <span className="font-medium text-red-600">Keluar</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </header>
    );
}