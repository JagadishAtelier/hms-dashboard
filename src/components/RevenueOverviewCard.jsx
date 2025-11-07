import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PencilLine, CreditCard } from "lucide-react";

export default function RevenueOverviewCard() {
  const revenueData = [
    { label: "Pharmacy", value: 76, revenue: 1234567, color: "bg-blue-500" },
    { label: "Outpatient (OP)", value: 64, revenue: 923457, color: "bg-green-500" },
    { label: "Admissions", value: 82, revenue: 1423457, color: "bg-purple-500" },
    { label: "Lab", value: 58, revenue: 823457, color: "bg-orange-600" },
    { label: "Others", value: 45, revenue: 623457, color: "bg-red-500" },
  ];

  const formatCurrency = (n) =>
    "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

  return (
    <Card className="w-full h-full max-w-md border border-gray-200 shadow-sm rounded-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-semibold text-gray-800">
          Revenue overview
        </CardTitle>

        <Select defaultValue="30">
          <SelectTrigger className="w-[110px] cursor-pointer h-8 text-sm border-gray-200">
            <SelectValue placeholder="Duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7" className='cursor-pointer'>7 days</SelectItem>
            <SelectItem value="30" className='cursor-pointer'>30 days</SelectItem>
            <SelectItem value="90" className='cursor-pointer'>90 days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="space-y-10">
        <div className="text-3xl font-bold text-center text-gray-700">
          ₹41,23,457
        </div>

        <div className="space-y-3 pt-3 border-t border-gray-100">
          <TooltipProvider>
            {revenueData.map((item, i) => (
              <Tooltip key={i}>
                <TooltipTrigger asChild>
                  <div className="cursor-pointer group">
                    <div className="flex justify-between text-sm text-gray-700">
                      <span>{item.label}</span>
                      <span>{item.value}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full shadow-inner bg-gray-100 overflow-hidden">
                      <div
                        className={`h-2 rounded-full ${item.color} group-hover:opacity-80 transition-all duration-300`}
                        style={{ width: `${item.value}%` }}
                      ></div>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className={`text-xs rounded font-medium ${item.color} `}>
                  {formatCurrency(item.revenue)}
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}
