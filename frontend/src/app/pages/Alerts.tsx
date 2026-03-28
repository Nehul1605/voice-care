import { useState, useEffect } from "react";
import { Link } from "react-router";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { getRiskBadgeClass } from "../data/mockData";
import { useCalls } from "../data/useCalls";

export default function Alerts() {
  const { calls, loading } = useCalls();
  const [filter, setFilter] = useState<"all" | "unacknowledged" | "acknowledged">("all");
  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const saved = localStorage.getItem("voicecare_acknowledged_alerts");
    if (saved) {
      try {
        setAcknowledgedIds(new Set(JSON.parse(saved)));
      } catch (e) {
      }
    }
  }, []);

  const acknowledgeAlert = (id: string) => {
    const newSet = new Set(acknowledgedIds);
    newSet.add(id);
    setAcknowledgedIds(newSet);
    localStorage.setItem("voicecare_acknowledged_alerts", JSON.stringify([...newSet]));
  };

  if (loading) {
    return <div className="p-8">Loading Alerts...</div>;
  }

  const allAlerts = calls
    .filter(call => ["high", "critical"].includes((call.risk_classification || "").toLowerCase()))
    .map(call => {
      let symList: string[] = [];
      if (Array.isArray(call.symptoms)) {
         symList = call.symptoms.map(s => String(s));
      } else if (typeof call.symptoms === "object" && call.symptoms !== null) {
         symList = Object.values(call.symptoms).map(s => String(s));
      } else if (typeof call.symptoms === "string") {
         symList = [call.symptoms];
      }

      return {
        id: call.id,
        patientId: call.patient_id,
        patientName: call.patient?.name || "Unknown Patient",
        riskLevel: (call.risk_classification || "High").toLowerCase(),
        timestamp: call.started_at || call.created_at,
        acknowledged: acknowledgedIds.has(call.id),
        symptoms: symList
      };
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const filteredAlerts = allAlerts.filter(alert => {
    if (filter === "unacknowledged") return !alert.acknowledged;
    if (filter === "acknowledged") return alert.acknowledged;
    return true;
  });

  const unacknowledgedCount = allAlerts.filter(a => !a.acknowledged).length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2 text-primary">Alerts</h1>
        <p className="text-muted-foreground">Real-time patient risk notifications</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-card p-6 rounded-xl shadow-md border border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <div className="text-2xl text-red-600">{unacknowledgedCount}</div>
              <p className="text-sm text-muted-foreground">Needs Attention</p>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl shadow-md border border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl text-green-600">
                {allAlerts.filter(a => a.acknowledged).length}
              </div>
              <p className="text-sm text-muted-foreground">Acknowledged</p>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl shadow-md border border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl text-primary">{allAlerts.length}</div>
              <p className="text-sm text-muted-foreground">Total High/Critical Risks</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-md border border-border overflow-hidden mb-6">
        <div className="flex border-b border-border">
          <button
            onClick={() => setFilter("all")}
            className={`flex-1 px-6 py-4 text-sm transition-colors ${filter === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary/30"}`}
          >
            All Alerts ({allAlerts.length})
          </button>
          <button
            onClick={() => setFilter("unacknowledged")}
            className={`flex-1 px-6 py-4 text-sm transition-colors ${filter === "unacknowledged" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary/30"}`}
          >
            Needs Attention ({unacknowledgedCount})
          </button>
          <button
            onClick={() => setFilter("acknowledged")}
            className={`flex-1 px-6 py-4 text-sm transition-colors ${filter === "acknowledged" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary/30"}`}
          >
            Acknowledged ({allAlerts.filter(a => a.acknowledged).length})
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <div 
            key={alert.id}
            className={`bg-card p-6 rounded-xl shadow-md border hover:shadow-lg transition-shadow ${alert.acknowledged ? "border-border opacity-70" : "border-red-200"}`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getRiskBadgeClass(alert.riskLevel)}`}>
                <AlertTriangle className="w-6 h-6" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <Link 
                      to={`/dashboard/patients/${alert.patientId}`}
                      className="text-lg text-primary hover:underline font-semibold"
                    >
                      {alert.patientName}
                    </Link>
                    <div className={`inline-block ml-3 px-3 py-1 rounded-full text-xs font-semibold capitalize ${getRiskBadgeClass(alert.riskLevel)}`}>
                      {alert.riskLevel} Risk
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleString("en-IN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </div>
                    {alert.acknowledged ? (
                      <div className="flex items-center gap-1 text-green-600 text-sm mt-1 justify-end">
                        <CheckCircle className="w-4 h-4" />
                        Acknowledged
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-600 text-sm mt-1 justify-end font-medium">
                        <Clock className="w-4 h-4" />
                        Pending Action
                      </div>
                    )}
                  </div>
                </div>

                {alert.symptoms.length > 0 ? (
                  <div className="mb-4">
                    <h4 className="text-sm mb-2 text-muted-foreground font-medium">Reported Symptoms:</h4>
                    <div className="flex flex-wrap gap-2">
                      {alert.symptoms.map((symptom, idx) => (
                        <span key={idx} className="bg-secondary/50 border border-border px-3 py-1 rounded-md text-sm">
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 text-sm text-muted-foreground italic">
                    No discrete symptoms extracted. Review transcript for details.
                  </div>
                )}

                <div className="flex gap-3 mt-4">
                  <Link
                    to={`/dashboard/patients/${alert.patientId}`}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                  >
                    View Patient File
                  </Link>
                  {!alert.acknowledged && (
                    <button 
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="px-4 py-2 bg-secondary text-secondary-foreground border border-border rounded-lg hover:bg-secondary/80 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark Acknowledged
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredAlerts.length === 0 && (
          <div className="bg-card p-12 rounded-xl shadow-md border border-border text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-primary mb-1">No Active Alerts</h3>
            <p className="text-muted-foreground">All patient risk factors are currently within acceptable limits.</p>
          </div>
        )}
      </div>
    </div>
  );
}
