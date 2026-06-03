import { toast } from 'vue-sonner';

function getToastOptions(description?: string) {
  return description ? { description } : undefined;
}

export function showSuccessToast(message: string, description?: string) {
  toast.success(message, getToastOptions(description));
}

export function showErrorToast(message: string, description?: string) {
  toast.error(message, getToastOptions(description));
}
