import React from 'react';
import { Megaphone } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

type AnnouncementModalProps = {
    open: boolean;
    onClose: () => void;
    announcement: {
        title: string;
        message: string;
        audience: string;
        priority: string;
        category: string;
        status: string;
        expiryDate: string;
        publishDate?: string;
        tags?: string[];
        examName?: string;
        examCode?: string;
    } | null;
};

export default function AnnouncementModal({ open, onClose, announcement }: AnnouncementModalProps) {
    if (!announcement) return null;
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-xl p-0 rounded-2xl shadow-lg">
                <DialogHeader className="border-b pb-4 mb-4 bg-blue-50 rounded-t-2xl px-6 pt-4">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3 w-full">
                            <div className="p-2 bg-blue-100 rounded-xl">
                                <Megaphone className="w-6 h-6 text-blue-600" />
                            </div>
                            <DialogTitle className="whitespace-normal break-words text-2xl font-bold text-gray-900 flex-1">
                                {announcement.title}
                            </DialogTitle>
                            {/* Only one close button is needed, keep the DialogClose below if present elsewhere */}
                        </div>
                        <p className="text-gray-600 text-sm pl-10">Announcement Details</p>
                    </div>
                </DialogHeader>
                <div className="space-y-6 px-6 pb-8">
                    <div className="whitespace-pre-line break-words text-base text-gray-800 bg-white rounded-lg p-4 border shadow-sm">
                        <span className="font-semibold text-blue-700">Message:</span>
                        <br />{announcement.message}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 bg-gray-50 rounded-lg p-4 border">
                        <div className="flex flex-col"><span className="font-semibold">Audience:</span> {announcement.audience}</div>
                        {announcement.examName && (
                            <div className="flex flex-col">
                                <span className="font-semibold text-orange-700">Exam:</span>
                                <div className="bg-orange-100/60 text-orange-800 px-3 py-1.5 rounded-md mt-1 inline-block">
                                    <span className="font-medium">{announcement.examName}</span>
                                    {announcement.examCode && <span className="ml-1.5 text-sm">({announcement.examCode})</span>}
                                </div>
                            </div>
                        )}
                        <div className="flex flex-col"><span className="font-semibold">Priority:</span> {announcement.priority}</div>
                        <div className="flex flex-col"><span className="font-semibold">Category:</span> {announcement.category}</div>
                        <div className="flex flex-col"><span className="font-semibold">Status:</span> {announcement.status}</div>
                        <div className="flex flex-col"><span className="font-semibold">Expiry Date:</span> {announcement.expiryDate}</div>
                        {announcement.publishDate && <div className="flex flex-col"><span className="font-semibold">Publish Date:</span> {announcement.publishDate}</div>}
                    </div>
                    {announcement.tags && announcement.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2 items-center">
                            <span className="font-semibold">Tags:</span>
                            {announcement.tags.map((tag: string) => (
                                <Badge key={tag} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">{tag}</Badge>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
