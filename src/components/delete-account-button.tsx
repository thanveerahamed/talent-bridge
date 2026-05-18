import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Trash2 } from 'lucide-react';
import { deleteAccount } from '@/lib/auth';
import { toast } from 'sonner';

interface DeleteAccountButtonProps {
  /** "icon" = icon button, "full" = full-width text button, "menuItem" = dropdown menu style */
  variant?: 'icon' | 'full' | 'menuItem';
}

export function DeleteAccountButton({ variant = 'icon' }: DeleteAccountButtonProps) {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirmation !== 'DELETE') return;
    setDeleting(true);
    try {
      await deleteAccount();
      toast.success('Account deleted successfully.');
    } catch {
      toast.error('Failed to delete account. You may need to sign in again.');
    } finally {
      setDeleting(false);
      setOpen(false);
      setConfirmation('');
    }
  };

  const trigger = (() => {
    switch (variant) {
      case 'full':
        return (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-destructive hover:text-destructive"
            onClick={() => setOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete Account
          </Button>
        );
      case 'menuItem':
        return (
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive outline-none hover:bg-accent cursor-pointer"
            onClick={() => setOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete Account
          </button>
        );
      case 'icon':
      default:
        return (
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            aria-label="Delete account"
            onClick={() => setOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        );
    }
  })();

  return (
    <>
      {trigger}
      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          setConfirmation('');
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              This action is permanent and cannot be undone. All your data including your profile,
              listings, and authentication will be removed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="deleteConfirm">
              Type <span className="font-mono font-bold">DELETE</span> to confirm
            </Label>
            <Input
              id="deleteConfirm"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="DELETE"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={confirmation !== 'DELETE' || deleting}
            >
              {deleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
