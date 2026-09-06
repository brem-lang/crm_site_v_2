import { Form, Head, Link } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import UserController from '@/actions/App/Http/Controllers/Admin/UserController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index } from '@/routes/admin/users';
import type { User } from '@/types';

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedUsers = {
    data: User[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    total: number;
};

export default function UsersIndex({ users }: { users: PaginatedUsers }) {
    const [createOpen, setCreateOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);

    return (
        <>
            <Head title="Users" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between gap-4">
                    <Heading
                        title="Users"
                        description="Create, edit, and remove user accounts"
                    />

                    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                        <Button onClick={() => setCreateOpen(true)}>
                            <Plus />
                            Add user
                        </Button>

                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add user</DialogTitle>
                                <DialogDescription>
                                    Create a new user account.
                                </DialogDescription>
                            </DialogHeader>

                            <Form
                                {...UserController.store.form()}
                                resetOnSuccess
                                onSuccess={() => setCreateOpen(false)}
                                className="space-y-4"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="grid gap-2">
                                            <Label htmlFor="create-name">
                                                Name
                                            </Label>
                                            <Input
                                                id="create-name"
                                                name="name"
                                                required
                                                autoComplete="name"
                                            />
                                            <InputError message={errors.name} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="create-email">
                                                Email
                                            </Label>
                                            <Input
                                                id="create-email"
                                                type="email"
                                                name="email"
                                                required
                                                autoComplete="email"
                                            />
                                            <InputError
                                                message={errors.email}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="create-password">
                                                Password
                                            </Label>
                                            <PasswordInput
                                                id="create-password"
                                                name="password"
                                                required
                                                autoComplete="new-password"
                                            />
                                            <InputError
                                                message={errors.password}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="create-password_confirmation">
                                                Confirm password
                                            </Label>
                                            <PasswordInput
                                                id="create-password_confirmation"
                                                name="password_confirmation"
                                                required
                                                autoComplete="new-password"
                                            />
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <Checkbox
                                                id="create-is_admin"
                                                name="is_admin"
                                            />
                                            <Label htmlFor="create-is_admin">
                                                Administrator
                                            </Label>
                                        </div>

                                        <DialogFooter className="gap-2">
                                            <DialogClose asChild>
                                                <Button variant="secondary">
                                                    Cancel
                                                </Button>
                                            </DialogClose>
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                            >
                                                Create user
                                            </Button>
                                        </DialogFooter>
                                    </>
                                )}
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="border-sidebar-border/70 dark:border-sidebar-border overflow-x-auto rounded-xl border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-sidebar-border/70 dark:border-sidebar-border border-b text-left">
                                <th className="px-4 py-2 font-medium">Name</th>
                                <th className="px-4 py-2 font-medium">Email</th>
                                <th className="px-4 py-2 font-medium">Role</th>
                                <th className="px-4 py-2 font-medium">
                                    Joined
                                </th>
                                <th className="px-4 py-2 font-medium">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.data.map((user) => (
                                <tr
                                    key={user.id}
                                    className="border-sidebar-border/70 dark:border-sidebar-border border-b last:border-0"
                                >
                                    <td className="px-4 py-2">{user.name}</td>
                                    <td className="px-4 py-2">{user.email}</td>
                                    <td className="px-4 py-2">
                                        {user.is_admin ? (
                                            <Badge>Admin</Badge>
                                        ) : (
                                            <Badge variant="secondary">
                                                User
                                            </Badge>
                                        )}
                                    </td>
                                    <td className="px-4 py-2">
                                        {new Date(
                                            user.created_at,
                                        ).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-2">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                aria-label={`Edit ${user.name}`}
                                                onClick={() =>
                                                    setEditingUser(user)
                                                }
                                            >
                                                <Pencil />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                aria-label={`Delete ${user.name}`}
                                                onClick={() =>
                                                    setDeletingUser(user)
                                                }
                                            >
                                                <Trash2 />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {users.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="text-muted-foreground px-4 py-6 text-center"
                                    >
                                        No users yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {users.last_page > 1 && (
                    <div className="flex flex-wrap items-center gap-1">
                        {users.links.map((link, i) => (
                            <Button
                                key={i}
                                asChild={link.url !== null}
                                disabled={link.url === null}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                            >
                                {link.url !== null ? (
                                    <Link
                                        href={link.url}
                                        preserveScroll
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ) : (
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                )}
                            </Button>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit user dialog */}
            <Dialog
                open={editingUser !== null}
                onOpenChange={(open) => !open && setEditingUser(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit user</DialogTitle>
                        <DialogDescription>
                            Update this user&apos;s account details.
                        </DialogDescription>
                    </DialogHeader>

                    {editingUser && (
                        <Form
                            key={editingUser.id}
                            {...UserController.update.form(editingUser)}
                            onSuccess={() => setEditingUser(null)}
                            className="space-y-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-name">Name</Label>
                                        <Input
                                            id="edit-name"
                                            name="name"
                                            defaultValue={editingUser.name}
                                            required
                                            autoComplete="name"
                                        />
                                        <InputError message={errors.name} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-email">
                                            Email
                                        </Label>
                                        <Input
                                            id="edit-email"
                                            type="email"
                                            name="email"
                                            defaultValue={editingUser.email}
                                            required
                                            autoComplete="email"
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-password">
                                            New password
                                        </Label>
                                        <PasswordInput
                                            id="edit-password"
                                            name="password"
                                            placeholder="Leave blank to keep current password"
                                            autoComplete="new-password"
                                        />
                                        <InputError message={errors.password} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-password_confirmation">
                                            Confirm new password
                                        </Label>
                                        <PasswordInput
                                            id="edit-password_confirmation"
                                            name="password_confirmation"
                                            autoComplete="new-password"
                                        />
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <Checkbox
                                            id="edit-is_admin"
                                            name="is_admin"
                                            defaultChecked={
                                                editingUser.is_admin
                                            }
                                        />
                                        <Label htmlFor="edit-is_admin">
                                            Administrator
                                        </Label>
                                    </div>

                                    <DialogFooter className="gap-2">
                                        <DialogClose asChild>
                                            <Button variant="secondary">
                                                Cancel
                                            </Button>
                                        </DialogClose>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            Save changes
                                        </Button>
                                    </DialogFooter>
                                </>
                            )}
                        </Form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete user dialog */}
            <Dialog
                open={deletingUser !== null}
                onOpenChange={(open) => !open && setDeletingUser(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete user</DialogTitle>
                        <DialogDescription>
                            {deletingUser &&
                                `Are you sure you want to delete ${deletingUser.name}? This cannot be undone.`}
                        </DialogDescription>
                    </DialogHeader>

                    {deletingUser && (
                        <Form
                            {...UserController.destroy.form(deletingUser)}
                            onSuccess={() => setDeletingUser(null)}
                        >
                            {({ processing }) => (
                                <DialogFooter className="gap-2">
                                    <DialogClose asChild>
                                        <Button variant="secondary">
                                            Cancel
                                        </Button>
                                    </DialogClose>
                                    <Button
                                        type="submit"
                                        variant="destructive"
                                        disabled={processing}
                                    >
                                        Delete user
                                    </Button>
                                </DialogFooter>
                            )}
                        </Form>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

UsersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Users',
            href: index(),
        },
    ],
};
