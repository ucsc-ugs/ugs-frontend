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
        exam_title?: string;
        exam_code?: string;
        exam_id?: number;
        is_pinned?: boolean;
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
                        </div>
                        <p className="text-gray-600 text-sm pl-10">Notification Details</p>
                    </div>
                </DialogHeader>
                <div className="space-y-6 px-6 pb-8">
                    <div className="whitespace-pre-line break-words text-base text-gray-800 bg-white rounded-lg p-4 border shadow-sm">
                        <span className="font-semibold text-blue-700">Message:</span>
                        <br />{announcement.message}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 bg-gray-50 rounded-lg p-4 border">
                        <div className="flex flex-col"><span className="font-semibold">Audience:</span> {announcement.audience}</div>
                        <div className="flex flex-col"><span className="font-semibold">Priority:</span> {announcement.priority}</div>
                        <div className="flex flex-col"><span className="font-semibold">Category:</span> {announcement.category}</div>
                        <div className="flex flex-col"><span className="font-semibold">Status:</span> {announcement.status}</div>
                        <div className="flex flex-col"><span className="font-semibold">Expiry Date:</span> {announcement.expiryDate}</div>
                        {announcement.publishDate && <div className="flex flex-col"><span className="font-semibold">Publish Date:</span> {announcement.publishDate}</div>}
                        {announcement.exam_title && <div className="flex flex-col"><span className="font-semibold">Exam Title:</span> {announcement.exam_title}</div>}
                        {announcement.exam_code && <div className="flex flex-col"><span className="font-semibold">Exam Code:</span> {announcement.exam_code}</div>}
                        {typeof announcement.exam_id !== 'undefined' && <div className="flex flex-col"><span className="font-semibold">Exam ID:</span> {announcement.exam_id}</div>}
                        {typeof announcement.is_pinned !== 'undefined' && <div className="flex flex-col"><span className="font-semibold">Pinned:</span> {announcement.is_pinned ? 'Yes' : 'No'}</div>}
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
