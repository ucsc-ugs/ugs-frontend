import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  children
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">{message}</p>
          {children}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              {cancelText}
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {confirmText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
