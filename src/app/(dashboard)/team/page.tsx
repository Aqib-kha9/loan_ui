"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Shield, Users, Check, Lock, MoreHorizontal, UserPlus, Search, AlertCircle, LayoutGrid, Unlock, Ban, Key, Trash2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/components/providers/auth-provider";
import { PERMISSIONS, PERMISSION_MATRIX } from "@/lib/constants/permissions";
import { Badge } from "@/components/ui/badge";
import { Loader, FullPageLoader } from "@/components/ui/loader";

// Types
interface Role {
    _id: string;
    name: string;
    permissions: string[];
}
interface User {
    _id: string;
    name: string;
    email: string;
    role: Role;
    status: 'active' | 'blocked' | 'inactive';
}

export default function TeamPage() {
    const { user, checkPermission } = useAuth(); // Added checkPermission
    const [activeTab, setActiveTab] = useState("team");
    const [roles, setRoles] = useState<Role[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false); // Global submitting state for dialogs

    // Form States
    const [newRoleName, setNewRoleName] = useState("");
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);

    // Role Edit/Delete States
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
    const [isDeleteRoleOpen, setIsDeleteRoleOpen] = useState(false);

    // New User Form States
    const [newUserState, setNewUserState] = useState({ name: "", email: "", password: "", roleId: "" });
    const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);

    // Dialog States
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [resetDetails, setResetDetails] = useState({ password: "" });

    // Fetch Data
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [rolesRes, usersRes] = await Promise.all([
                fetch("/api/roles", { cache: "no-store" }),
                fetch("/api/users", { cache: "no-store" })
            ]);

            if (rolesRes.ok) {
                const data = await rolesRes.json();
                setRoles(data.roles);
            }
            if (usersRes.ok) {
                const data = await usersRes.json();
                setUsers(data.users);
            }
        } catch (error) {
            toast.error("Failed to load team data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Handlers
    const handleCreateRole = async () => {
        if (!newRoleName) return toast.error("Role Name is required");
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/roles", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newRoleName, permissions: selectedPermissions })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            toast.success("Role Created");
            setRoles([...roles, data.role]);
            setIsCreateRoleOpen(false);
            setNewRoleName("");
            setSelectedPermissions([]);
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleUpdateRole = async () => {
        if (!selectedRole || !newRoleName) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/roles/${selectedRole._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newRoleName, permissions: selectedPermissions })
            });
            if (!res.ok) throw new Error("Failed to update role");

            toast.success("Role Updated");
            setRoles(roles.map(r => r._id === selectedRole._id ? { ...r, name: newRoleName, permissions: selectedPermissions } : r));
            setIsEditRoleOpen(false);
            setSelectedRole(null);
            setNewRoleName("");
            setSelectedPermissions([]);
        } catch (error) {
            toast.error("Error updating role");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteRole = async () => {
        if (!selectedRole) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/roles/${selectedRole._id}`, { method: 'DELETE' });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to delete role");

            toast.success("Role Deleted");
            setRoles(roles.filter(r => r._id !== selectedRole._id));
            setIsDeleteRoleOpen(false);
            setSelectedRole(null);
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const openEditRole = (role: Role) => {
        setSelectedRole(role);
        setNewRoleName(role.name);
        setSelectedPermissions(role.permissions);
        setIsEditRoleOpen(true);
    };

    const openDeleteRole = (role: Role) => {
        setSelectedRole(role);
        setIsDeleteRoleOpen(true);
    };

    const handleCreateUser = async () => {
        if (!newUserState.email || !newUserState.password || !newUserState.roleId) return toast.error("All fields required");
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newUserState)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            toast.success("User Invited");
            fetchData();
            setIsCreateUserOpen(false);
            setNewUserState({ name: "", email: "", password: "", roleId: "" });
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleUpdateStatus = async (userId: string, status: string) => {
        try {
            const res = await fetch(`/api/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (!res.ok) throw new Error("Failed to update status");

            // Optimistic / Immediate Update
            setUsers(users.map(u => u._id === userId ? { ...u, status: status as any } : u));

            toast.success(`User marked as ${status}`);
            fetchData();
        } catch (error) {
            toast.error("Error updating status");
        }
    };

    const confirmDeleteUser = (user: User) => {
        setSelectedUser(user);
        setIsDeleteConfirmOpen(true);
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/users/${selectedUser._id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Failed to delete user");
            toast.success("User deleted");
            setUsers(users.filter(u => u._id !== selectedUser._id));
            setIsDeleteConfirmOpen(false);
            setSelectedUser(null);
        } catch (error) {
            toast.error("Error deleting user");
        } finally {
            setIsSubmitting(false);
        }
    };

    const triggerResetPassword = (user: User) => {
        setSelectedUser(user);
        setResetDetails({ password: "" });
        setIsResetPasswordOpen(true);
    };

    const handleResetPassword = async () => {
        if (!selectedUser || !resetDetails.password) return;
        setIsSubmitting(true);

        try {
            const res = await fetch(`/api/users/${selectedUser._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: resetDetails.password })
            });
            if (!res.ok) throw new Error("Failed to reset password");
            toast.success("Password updated successfully");
            setIsResetPasswordOpen(false);
            setSelectedUser(null);
        } catch (error) {
            toast.error("Error resetting password");
        } finally {
            setIsSubmitting(false);
        }
    };

    const [isEditUserOpen, setIsEditUserOpen] = useState(false);
    const [editDetails, setEditDetails] = useState({ name: "" });

    // Handlers
    const handleUpdateName = async () => {
        if (!selectedUser || !editDetails.name) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/users/${selectedUser._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editDetails.name })
            });
            if (!res.ok) throw new Error("Failed to update name");
            toast.success("Name updated successfully");
            fetchData();
            setIsEditUserOpen(false);
            setSelectedUser(null);
        } catch (error) {
            toast.error("Error updating name");
        } finally {
            setIsSubmitting(false);
        }
    };

    const triggerEditUser = (user: User) => {
        setSelectedUser(user);
        setEditDetails({ name: user.name });
        setIsEditUserOpen(true);
    };

    const togglePermission = (perm: string) => {
        if (selectedPermissions.includes(perm)) {
            setSelectedPermissions(selectedPermissions.filter(p => p !== perm));
        } else {
            setSelectedPermissions([...selectedPermissions, perm]);
        }
    };

    const toggleGroupPermission = (groupPermissions: string[]) => {
        const allSelected = groupPermissions.every(p => selectedPermissions.includes(p));
        if (allSelected) {
            setSelectedPermissions(selectedPermissions.filter(p => !groupPermissions.includes(p)));
        } else {
            // Add missing ones
            const toAdd = groupPermissions.filter(p => !selectedPermissions.includes(p));
            setSelectedPermissions([...selectedPermissions, ...toAdd]);
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="relative -m-6 md:-m-8 w-[calc(100%+3rem)] md:w-[calc(100%+4rem)] h-[calc(100vh-5rem)] bg-muted/10 flex flex-col overflow-hidden">
            {isLoading && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-300">
                    <Loader size="xl" />
                </div>
            )}

            {/* === 1. STICKY HEADER === */}
            <div className="h-13 md:h-14 border-b border-border/50 flex items-center justify-between px-4 bg-white/95 backdrop-blur-xl shrink-0 dark:bg-zinc-950/95 sticky top-0 z-30">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/10 flex items-center justify-center text-primary shadow-sm">
                        <Users className="h-4 w-4" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold leading-none tracking-tight">Team & Access</h1>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Manage {users.length} members & {roles.length} roles</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    {/* Compact Search */}
                    <div className="relative w-32 md:w-64 hidden sm:block">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            placeholder="Search members..."
                            className="pl-8 h-8 text-xs bg-muted/20 border-border/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="hidden md:flex">
                        <TabsList className="h-8 p-0.5 bg-muted/20">
                            <TabsTrigger value="team" className="h-7 text-[10px] px-3 gap-2">Team</TabsTrigger>
                            <TabsTrigger value="roles" className="h-7 text-[10px] px-3 gap-2">Roles</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {activeTab === "team" ? (
                        <>
                            <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
                                {checkPermission(PERMISSIONS.CREATE_USER) && (
                                    <DialogTrigger asChild>
                                        <Button size="sm" className="h-8 gap-2 text-xs font-bold shadow-md shadow-primary/20 cursor-pointer" title="Invite New Member">
                                            <UserPlus className="h-3.5 w-3.5" /> <span className="hidden md:inline">Invite Member</span>
                                        </Button>
                                    </DialogTrigger>
                                )}
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Invite Information</DialogTitle>
                                        <DialogDescription>Create a new user account for your team.</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Full Name</Label>
                                            <Input
                                                placeholder="John Doe"
                                                value={newUserState.name}
                                                onChange={(e) => setNewUserState({ ...newUserState, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Email</Label>
                                            <Input
                                                placeholder="john@company.com"
                                                value={newUserState.email}
                                                onChange={(e) => setNewUserState({ ...newUserState, email: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Temporary Password</Label>
                                            <Input
                                                type="password"
                                                value={newUserState.password}
                                                onChange={(e) => setNewUserState({ ...newUserState, password: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Role</Label>
                                            <Select onValueChange={(val) => setNewUserState({ ...newUserState, roleId: val })}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {roles.filter(r => r.name !== 'Admin').map((role) => (
                                                        <SelectItem key={role._id} value={role._id}>
                                                            {role.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button onClick={handleCreateUser} className="w-full" loading={isSubmitting}>Send Invite</Button>
                                    </div>
                                </DialogContent>
                            </Dialog>

                            {/* Reset Password Dialog */}
                            <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Reset Password</DialogTitle>
                                        <DialogDescription>Set a new password for {selectedUser?.name}.</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>New Password</Label>
                                            <Input
                                                type="password"
                                                value={resetDetails.password}
                                                onChange={(e) => setResetDetails({ password: e.target.value })}
                                            />
                                        </div>
                                        <Button onClick={handleResetPassword} className="w-full" loading={isSubmitting}>Update Password</Button>
                                    </div>
                                </DialogContent>
                            </Dialog>

                            {/* Confirm Delete Dialog */}
                            <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Confirm Deletion</DialogTitle>
                                        <DialogDescription>
                                            Are you sure you want to delete <b>{selectedUser?.name}</b>? This action cannot be undone.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="flex justify-end gap-3 pt-4">
                                        <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>Cancel</Button>
                                        <Button variant="destructive" onClick={handleDeleteUser}>Delete User</Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </>
                    ) : (
                        <Dialog open={isCreateRoleOpen} onOpenChange={setIsCreateRoleOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" className="h-8 gap-2 text-xs font-bold shadow-md shadow-primary/20 cursor-pointer" title="Create New Role">
                                    <Plus className="h-3.5 w-3.5" /> <span className="hidden md:inline">Create Role</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Create New Role</DialogTitle>
                                    <DialogDescription>Define a set of permissions for this role.</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-6 py-4">
                                    <div className="space-y-2">
                                        <Label>Role Name</Label>
                                        <Input
                                            placeholder="e.g. Loan Officer"
                                            value={newRoleName}
                                            onChange={(e) => setNewRoleName(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label>Permissions Access</Label>
                                        <div className="border rounded-md overflow-hidden">
                                            <Table>
                                                <TableHeader className="bg-muted/50">
                                                    <TableRow>
                                                        <TableHead className="w-[180px] font-bold">Feature</TableHead>
                                                        <TableHead className="text-center w-24">View</TableHead>
                                                        <TableHead className="text-center w-24">Add</TableHead>
                                                        <TableHead className="text-center w-24">Edit</TableHead>
                                                        <TableHead className="text-center w-24">Delete</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {PERMISSION_MATRIX.map((row) => (
                                                        <TableRow key={row.feature} className="hover:bg-muted/5">
                                                            <TableCell className="font-medium text-xs uppercase tracking-wide py-3">
                                                                {row.feature}
                                                            </TableCell>
                                                            {['view', 'add', 'edit', 'delete'].map((action) => {
                                                                const permKey = row.permissions[action as keyof typeof row.permissions];
                                                                const isChecked = permKey ? selectedPermissions.includes(permKey) : false;

                                                                return (
                                                                    <TableCell key={action} className="text-center py-2">
                                                                        {permKey ? (
                                                                            <Checkbox
                                                                                checked={isChecked}
                                                                                onCheckedChange={() => togglePermission(permKey)}
                                                                                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                                            />
                                                                        ) : (
                                                                            <div className="h-4 w-4 bg-muted/20 rounded-sm mx-auto border border-muted" />
                                                                        )}
                                                                    </TableCell>
                                                                );
                                                            })}
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                </div>
                                <Button onClick={handleCreateRole} className="w-full" loading={isSubmitting}>Create Role</Button>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </div>

            {/* === 2. SCROLLABLE TABLE CONTENT === */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Mobile Search & Filter (Visible only on mobile) */}
                <div className="flex flex-col gap-2 sm:hidden pb-2">
                    <div className="relative w-full">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            placeholder="Search..."
                            className="pl-8 h-8 text-xs bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="h-8 w-full bg-muted/20 p-0.5">
                            <TabsTrigger value="team" className="flex-1 h-7 text-[10px]">Team</TabsTrigger>
                            <TabsTrigger value="roles" className="flex-1 h-7 text-[10px]">Roles</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <div className="border rounded-xl bg-white shadow-sm overflow-hidden dark:bg-zinc-950">
                    <Tabs value={activeTab} className="w-full">
                        <TabsContent value="team" className="m-0">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="w-[300px]">Member</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center">
                                                No members found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredUsers.map((u) => (
                                            <TableRow key={u._id} className="group">
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary ring-2 ring-white dark:ring-zinc-900">
                                                            {u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-sm">{u.name}</span>
                                                            <span className="text-xs text-muted-foreground">{u.email}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="font-mono text-[10px] uppercase font-bold tracking-wider">
                                                        {u.role?.name || 'Unknown'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {(u.status === 'active' || !u.status) && (
                                                        <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200 uppercase text-[10px] px-2 font-bold tracking-wider pointer-events-none shadow-none">
                                                            Active
                                                        </Badge>
                                                    )}
                                                    {u.status === 'blocked' && (
                                                        <Badge variant="destructive" className="uppercase text-[10px] px-2 font-bold tracking-wider pointer-events-none shadow-none">
                                                            Blocked
                                                        </Badge>
                                                    )}
                                                    {u.status === 'inactive' && (
                                                        <Badge variant="outline" className="text-muted-foreground uppercase text-[10px] px-2 font-bold tracking-wider pointer-events-none shadow-none">
                                                            Inactive
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center gap-1 justify-end opacity-100 transition-opacity">
                                                        {/* Edit Name - For All Users */}
                                                        {checkPermission(PERMISSIONS.EDIT_USER) && (
                                                            <>
                                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-500 hover:text-gray-700 hover:bg-gray-100 cursor-pointer" onClick={() => triggerEditUser(u)} title="Edit Name">
                                                                    <Pencil className="h-3.5 w-3.5" />
                                                                </Button>

                                                                <Dialog open={isEditUserOpen && selectedUser?._id === u._id} onOpenChange={(open) => {
                                                                    setIsEditUserOpen(open);
                                                                    if (open) {
                                                                        setSelectedUser(u);
                                                                        setEditDetails({ name: u.name });
                                                                    } else setSelectedUser(null);
                                                                }}>
                                                                    <DialogContent>
                                                                        <DialogHeader>
                                                                            <DialogTitle>Edit User Info</DialogTitle>
                                                                            <DialogDescription>Update details for <strong>{u.name}</strong>.</DialogDescription>
                                                                        </DialogHeader>
                                                                        <div className="space-y-4 py-4">
                                                                            <div className="space-y-2">
                                                                                <Label>Full Name</Label>
                                                                                <Input
                                                                                    value={editDetails.name}
                                                                                    onChange={(e) => setEditDetails({ name: e.target.value })}
                                                                                />
                                                                            </div>
                                                                            <Button onClick={handleUpdateName} className="w-full" loading={isSubmitting}>Update Name</Button>
                                                                        </div>
                                                                    </DialogContent>
                                                                </Dialog>
                                                            </>
                                                        )}

                                                        {/* Block/Unblock - NOT for System Root */}
                                                        {checkPermission(PERMISSIONS.EDIT_USER) && u.email !== 'superadmin@fincorperp.com' && (
                                                            u.status === 'blocked' ? (
                                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-green-500 hover:text-green-600 hover:bg-green-50 cursor-pointer" onClick={() => handleUpdateStatus(u._id, 'active')} title="Unblock User">
                                                                    <Unlock className="h-3.5 w-3.5" />
                                                                </Button>
                                                            ) : (
                                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-amber-500 hover:text-amber-600 hover:bg-amber-50 cursor-pointer" onClick={() => handleUpdateStatus(u._id, 'blocked')} title="Block User">
                                                                    <Ban className="h-3.5 w-3.5" />
                                                                </Button>
                                                            )
                                                        )}

                                                        {/* Reset Password - For All Users */}
                                                        {checkPermission(PERMISSIONS.EDIT_USER) && (
                                                            <Dialog open={isResetPasswordOpen && selectedUser?._id === u._id} onOpenChange={(open) => {
                                                                setIsResetPasswordOpen(open);
                                                                if (open) setSelectedUser(u);
                                                                else setSelectedUser(null);
                                                            }}>
                                                                <DialogTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-500 hover:text-blue-600 hover:bg-blue-50 cursor-pointer" title="Reset Password">
                                                                        <Key className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                </DialogTrigger>
                                                                <DialogContent>
                                                                    <DialogHeader>
                                                                        <DialogTitle>Reset Password</DialogTitle>
                                                                        <DialogDescription>
                                                                            Set a new password for <strong>{u.name}</strong>.
                                                                        </DialogDescription>
                                                                    </DialogHeader>
                                                                    <div className="space-y-4 py-4">
                                                                        <div className="space-y-2">
                                                                            <Label>New Password</Label>
                                                                            <Input
                                                                                type="password"
                                                                                value={resetDetails.password}
                                                                                onChange={(e) => setResetDetails({ password: e.target.value })}
                                                                            />
                                                                        </div>
                                                                        <Button onClick={handleResetPassword} className="w-full" loading={isSubmitting}>
                                                                            Update Password
                                                                        </Button>
                                                                    </div>
                                                                </DialogContent>
                                                            </Dialog>
                                                        )}

                                                        {/* Delete - NOT for System Root */}
                                                        {checkPermission(PERMISSIONS.DELETE_USER) && u.email !== 'superadmin@fincorperp.com' && (
                                                            <Dialog open={isDeleteConfirmOpen && selectedUser?._id === u._id} onOpenChange={(open) => {
                                                                setIsDeleteConfirmOpen(open);
                                                                if (open) setSelectedUser(u);
                                                                else setSelectedUser(null);
                                                            }}>
                                                                <DialogTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer" title="Delete User">
                                                                        <Trash2 className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                </DialogTrigger>
                                                                <DialogContent>
                                                                    <DialogHeader>
                                                                        <DialogTitle>Delete User</DialogTitle>
                                                                        <DialogDescription>
                                                                            Are you sure you want to delete <strong>{u.name}</strong>? This action cannot be undone.
                                                                        </DialogDescription>
                                                                    </DialogHeader>
                                                                    <div className="flex justify-end gap-3 mt-4">
                                                                        <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>Cancel</Button>
                                                                        <Button variant="destructive" onClick={handleDeleteUser} loading={isSubmitting}>Delete User</Button>
                                                                    </div>
                                                                </DialogContent>
                                                            </Dialog>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TabsContent>

                        <TabsContent value="roles" className="m-0">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="w-[250px]">Role Name</TableHead>
                                        <TableHead>Permissions</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {roles.map((r) => (
                                        <TableRow key={r._id} className="group hover:bg-muted/5">
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Shield className="h-4 w-4 text-muted-foreground" />
                                                    {r.name}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1.5 max-w-[500px]">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-semibold text-muted-foreground">{r.permissions.length} Access Points</span>
                                                        <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-indigo-500 rounded-full"
                                                                style={{ width: `${(r.permissions.length / Object.keys(PERMISSIONS).length) * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground line-clamp-1">
                                                        {r.permissions.slice(0, 5).map(p => p.replace(/_/g, ' ')).join(', ')} {r.permissions.length > 5 && `+${r.permissions.length - 5} more`}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {r.name === 'Admin' ? (
                                                    <div className="flex items-center justify-end gap-1 text-muted-foreground opacity-50 cursor-not-allowed" title="System Role is Immutable">
                                                        <Lock className="h-4 w-4" />
                                                        <span className="text-[10px] font-medium uppercase tracking-wider">Locked</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-end gap-1">
                                                        {checkPermission(PERMISSIONS.EDIT_SETTINGS) && (
                                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-500 hover:text-gray-700 hover:bg-gray-100 cursor-pointer" onClick={() => openEditRole(r)} title="Edit Role">
                                                                <Pencil className="h-3.5 w-3.5" />
                                                            </Button>
                                                        )}
                                                        {checkPermission(PERMISSIONS.EDIT_SETTINGS) && (
                                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer" onClick={() => openDeleteRole(r)} title="Delete Role">
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Edit Role Dialog */}
                            <Dialog open={isEditRoleOpen} onOpenChange={setIsEditRoleOpen}>
                                <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                        <DialogTitle>Edit Role: {selectedRole?.name}</DialogTitle>
                                        <DialogDescription>Modify permissions for this role.</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-6 py-4">
                                        <div className="space-y-2">
                                            <Label>Role Name</Label>
                                            <Input
                                                value={newRoleName}
                                                onChange={(e) => setNewRoleName(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label>Permissions Access</Label>
                                            <div className="border rounded-md overflow-hidden max-h-[400px] overflow-y-auto">
                                                <Table>
                                                    <TableHeader className="bg-muted/50 sticky top-0 z-10">
                                                        <TableRow>
                                                            <TableHead className="w-[180px] font-bold">Feature</TableHead>
                                                            <TableHead className="text-center w-24">View</TableHead>
                                                            <TableHead className="text-center w-24">Add</TableHead>
                                                            <TableHead className="text-center w-24">Edit</TableHead>
                                                            <TableHead className="text-center w-24">Delete</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {PERMISSION_MATRIX.map((row) => (
                                                            <TableRow key={row.feature} className="hover:bg-muted/5">
                                                                <TableCell className="font-medium text-xs uppercase tracking-wide py-3">
                                                                    {row.feature}
                                                                </TableCell>
                                                                {['view', 'add', 'edit', 'delete'].map((action) => {
                                                                    const permKey = row.permissions[action as keyof typeof row.permissions];
                                                                    const isChecked = permKey ? selectedPermissions.includes(permKey) : false;

                                                                    return (
                                                                        <TableCell key={action} className="text-center py-2">
                                                                            {permKey ? (
                                                                                <Checkbox
                                                                                    checked={isChecked}
                                                                                    onCheckedChange={() => togglePermission(permKey)}
                                                                                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                                                />
                                                                            ) : (
                                                                                <div className="h-4 w-4 bg-muted/20 rounded-sm mx-auto border border-muted" />
                                                                            )}
                                                                        </TableCell>
                                                                    );
                                                                })}
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    </div>
                                    <Button onClick={handleUpdateRole} className="w-full" loading={isSubmitting}>Update Role</Button>
                                </DialogContent>
                            </Dialog>

                            {/* Delete Role Confirm Dialog */}
                            <Dialog open={isDeleteRoleOpen} onOpenChange={setIsDeleteRoleOpen}>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Delete Role</DialogTitle>
                                        <DialogDescription>
                                            Are you sure you want to delete the role <strong>{selectedRole?.name}</strong>? This action cannot be undone.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="flex justify-end gap-3 pt-4">
                                        <Button variant="outline" onClick={() => setIsDeleteRoleOpen(false)}>Cancel</Button>
                                        <Button variant="destructive" onClick={handleDeleteRole}>Delete Role</Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
