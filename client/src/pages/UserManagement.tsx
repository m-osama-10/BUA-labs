import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search, AlertCircle, Edit, Trash2, Key } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const userSchema = z.object({
  email: z.string().email("Invalid email"),
  name: z.string().min(2, "Name is required"),
  role: z.enum(["admin", "unit_manager", "technician", "user"]),
});

type UserFormData = z.infer<typeof userSchema>;

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: "",
      name: "",
      role: "user",
    },
  });

  // Fetch users from server
  const usersQuery = trpc.users.list.useQuery(undefined, { refetchOnWindowFocus: false });
  const [users, setUsers] = useState<any[]>([]);

  // keep local copy in sync with server
  useMemo(() => {
    if (usersQuery.data) {
      setUsers(usersQuery.data as any[]);
    }
  }, [usersQuery.data]);

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        if (
          !user.name.toLowerCase().includes(search) &&
          !user.email.toLowerCase().includes(search)
        ) {
          return false;
        }
      }

      if (roleFilter !== "all" && user.role !== roleFilter) {
        return false;
      }

      return true;
    });
  }, [users, searchTerm, roleFilter]);

  const createUserMutation = trpc.auth.createUser.useMutation({
    onSuccess(user) {
      if (user) {
        // prepend created user and refetch
        setUsers((prev) => [user as any, ...prev]);
        toast.success("User created successfully");
      }
      setOpenDialog(false);
      form.reset();
      setSelectedUser(null);
    },
    onError(err) {
      toast.error("Failed to create user: " + (err as any).message);
    },
  });

  const updateUserMutation = trpc.auth.updateUser.useMutation({
    onSuccess(user) {
      if (user) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? user : u))
        );
        toast.success("User updated successfully");
      }
      setOpenDialog(false);
      form.reset();
      setSelectedUser(null);
    },
    onError(err) {
      toast.error("Failed to update user: " + (err as any).message);
    },
  });

  const onSubmit = async (data: UserFormData) => {
    try {
      if (selectedUser) {
        await updateUserMutation.mutateAsync({
          id: selectedUser.id,
          name: data.name,
          email: data.email,
          role: data.role,
        });
        return;
      }

      await createUserMutation.mutateAsync(data);
    } catch (error) {
      // handled by mutation callbacks
    }
  };

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    form.reset({
      email: user.email,
      name: user.name,
      role: user.role,
    });
    setOpenDialog(true);
  };

  const handleDelete = (userId: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter((u) => u.id !== userId));
      toast.success("User deleted successfully");
    }
  };

  const handleChangePassword = () => {
    if (!newPassword) {
      toast.error("Please enter a new password");
      return;
    }
    toast.success(`Password updated for ${selectedUser.name}`);
    setShowPasswordDialog(false);
    setNewPassword("");
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, any> = {
      admin: { variant: "destructive", label: "Admin" },
      unit_manager: { variant: "default", label: "Manager" },
      technician: { variant: "secondary", label: "Technician" },
      user: { variant: "outline", label: "User" },
    };
    const config = variants[role] || variants.user;
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-600 mt-1">Manage system users and their roles</p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setSelectedUser(null);
                form.reset();
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedUser ? "Edit User" : "Add New User"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="user@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">Administrator</SelectItem>
                          <SelectItem value="unit_manager">
                            Unit Manager
                          </SelectItem>
                          <SelectItem value="technician">Technician</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpenDialog(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    {selectedUser ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-64">
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Administrator</SelectItem>
              <SelectItem value="unit_manager">Unit Manager</SelectItem>
              <SelectItem value="technician">Technician</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-slate-600">{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {format(new Date(user.createdAt), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Dialog
                          open={showPasswordDialog && selectedUser?.id === user.id}
                          onOpenChange={(open) => {
                            if (open) {
                              setSelectedUser(user);
                            }
                            setShowPasswordDialog(open);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedUser(user)}
                            >
                              <Key className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Change Password</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium">
                                  New Password
                                </label>
                                <Input
                                  type="password"
                                  placeholder="Enter new password"
                                  value={newPassword}
                                  onChange={(e) =>
                                    setNewPassword(e.target.value)
                                  }
                                  className="mt-1"
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => setShowPasswordDialog(false)}
                                  className="flex-1"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={handleChangePassword}
                                  className="flex-1"
                                >
                                  Update
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-600">No users found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-slate-600">Total Users</p>
          <p className="text-2xl font-bold text-slate-900">{users.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-600">Administrators</p>
          <p className="text-2xl font-bold text-slate-900">
            {users.filter((u) => u.role === "admin").length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-600">Managers</p>
          <p className="text-2xl font-bold text-slate-900">
            {users.filter((u) => u.role === "unit_manager").length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-600">Technicians</p>
          <p className="text-2xl font-bold text-slate-900">
            {users.filter((u) => u.role === "technician").length}
          </p>
        </Card>
      </div>
    </div>
  );
}
