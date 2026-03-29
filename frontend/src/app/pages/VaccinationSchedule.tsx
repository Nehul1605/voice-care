import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Upload, Plus, Download, FileSpreadsheet, Search } from "lucide-react";
import { fetchWithAuth } from "../../lib/api";

const vaccinationSchema = z.object({
  child_name: z.string().min(2, "Name is required"),
  age: z.string().or(z.number()),
  parents_number: z.string().min(10, "Valid phone number required"),
  vaccine_name: z.string().min(2, "Vaccine name is required"),
  dose: z.string().min(1, "Dose info is required"),
  next_vaccination_date: z.string().min(1, "Date is required"),
});

export default function VaccinationSchedule() {
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const form = useForm({
    resolver: zodResolver(vaccinationSchema),
    defaultValues: {
      child_name: "",
      age: "",
      parents_number: "",
      vaccine_name: "",
      dose: "1",
      next_vaccination_date: "",
    },
  });

  const loadVaccinations = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth("/vaccinations");
      setVaccinations(res.data || []);
    } catch (err) {
      console.error("Failed to load vaccinations", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVaccinations();
  }, []);

  const onSubmit = async (values) => {
    try {
      await fetchWithAuth("/vaccinations", {
        method: "POST",
        body: JSON.stringify(values),
      });
      loadVaccinations();
      form.reset();
      // Close modal logic would go here if handled by state
    } catch (err) {
      alert("Failed to add vaccination entry");
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result;
      const json = csvToJson(text);
      try {
        await fetchWithAuth("/vaccinations/import", {
          method: "POST",
          body: JSON.stringify({ data: json }),
        });
        loadVaccinations();
        alert("Imported successfully");
      } catch (err) {
        alert("Failed to import CSV");
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  };

  const csvToJson = (csv) => {
    const lines = csv.split("\n");
    const headers = lines[0].split(",");
    return lines.slice(1).map((line) => {
      const values = line.split(",");
      return headers.reduce((obj, header, i) => {
        obj[header.trim()] = values[i]?.trim();
        return obj;
      }, {});
    });
  };

  const filteredVaccinations = vaccinations.filter(
    (v) =>
      v.child_name.toLowerCase().includes(search.toLowerCase()) ||
      v.vaccine_name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-primary">
            Vaccination Schedule
          </h1>
          <p className="text-muted-foreground">
            Manage and track child vaccinations
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Input
              type="file"
              accept=".csv"
              className="hidden"
              id="csv-upload"
              onChange={handleFileUpload}
              disabled={isImporting}
            />
            <Button variant="outline" asChild>
              <label
                htmlFor="csv-upload"
                className="cursor-pointer flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {isImporting ? "Importing..." : "Import CSV"}
              </label>
            </Button>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Entry
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Vaccination Entry</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="child_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Child's Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age (Months)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="parents_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parents Number</FormLabel>
                          <FormControl>
                            <Input placeholder="1234567890" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="vaccine_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vaccine Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="BCG, Hepatitis B, etc."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="dose"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dose</FormLabel>
                          <FormControl>
                            <Input placeholder="Dose 1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="next_vaccination_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Next Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Save Entry
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-md border border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or vaccine..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Child Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Parents Number</TableHead>
                <TableHead>Vaccine Name</TableHead>
                <TableHead>Dose</TableHead>
                <TableHead>Next Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredVaccinations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No records found
                  </TableCell>
                </TableRow>
              ) : (
                filteredVaccinations.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">
                      {v.child_name}
                    </TableCell>
                    <TableCell>{v.age}m</TableCell>
                    <TableCell>{v.parents_number}</TableCell>
                    <TableCell>{v.vaccine_name}</TableCell>
                    <TableCell>{v.dose}</TableCell>
                    <TableCell>
                      {new Date(v.next_vaccination_date).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
