"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/dashboard/Card";
import { Badge } from "@/components/dashboard/Badge";
import { 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Users, 
  Settings,
  BookOpen,
  Target,
  Award,
  Calendar,
  TrendingUp,
  AlertCircle
} from "lucide-react";

interface NABLStatus {
  readinessScore: number;
  phase: 'preparation' | 'application' | 'assessment' | 'accredited';
  nextMilestone: string;
  estimatedAccreditationDate: string;
}

interface QualityManual {
  sections: Array<{
    name: string;
    status: 'completed' | 'in_progress' | 'pending';
    lastUpdated?: string;
  }>;
  overallCompletion: number;
}

interface ProficiencyTest {
  testName: string;
  provider: string;
  dueDate: string;
  status: 'enrolled' | 'completed' | 'pending' | 'overdue';
  score?: number;
}

export default function NABLPage() {
  const [nablStatus, setNablStatus] = useState<NABLStatus>({
    readinessScore: 65,
    phase: 'preparation',
    nextMilestone: 'Complete Quality Manual',
    estimatedAccreditationDate: '2024-08-15'
  });

  const [qualityManual, setQualityManual] = useState<QualityManual>({
    sections: [
      { name: 'Quality Policy & Objectives', status: 'completed', lastUpdated: '2024-01-15' },
      { name: 'Document Control', status: 'completed', lastUpdated: '2024-01-10' },
      { name: 'Management Responsibility', status: 'in_progress' },
      { name: 'Resource Management', status: 'in_progress' },
      { name: 'Pre-examination Processes', status: 'pending' },
      { name: 'Examination Processes', status: 'pending' },
      { name: 'Post-examination Processes', status: 'pending' },
      { name: 'Management System Improvement', status: 'pending' }
    ],
    overallCompletion: 35
  });

  const [proficiencyTests, setProficiencyTests] = useState<ProficiencyTest[]>([
    {
      testName: 'Clinical Chemistry PT',
      provider: 'CMC Vellore',
      dueDate: '2024-03-15',
      status: 'enrolled',
      score: 95
    },
    {
      testName: 'Hematology EQAS',
      provider: 'AIIMS Delhi',
      dueDate: '2024-02-28',
      status: 'completed',
      score: 92
    },
    {
      testName: 'Microbiology PT',
      provider: 'PGIMER Chandigarh',
      dueDate: '2024-04-10',
      status: 'pending'
    }
  ]);

  const [auditSchedule, setAuditSchedule] = useState([
    {
      type: 'Internal Audit - Pre-examination',
      date: '2024-02-20',
      auditor: 'Quality Manager',
      status: 'scheduled'
    },
    {
      type: 'Internal Audit - Examination',
      date: '2024-03-05',
      auditor: 'Technical Manager',
      status: 'pending'
    },
    {
      type: 'Management Review',
      date: '2024-03-20',
      auditor: 'Laboratory Director',
      status: 'pending'
    }
  ]);

  const [documentControl, setDocumentControl] = useState({
    totalDocuments: 45,
    controlledDocuments: 38,
    pendingReview: 7,
    overdueDocs: 2
  });

  return (
    <div className="space-y-6 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">NABL Accreditation</h1>
          <p className="text-slate-600">ISO 15189:2022 Medical Laboratories</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Generate Application
          </button>
          <button className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
            Schedule Assessment
          </button>
        </div>
      </div>

      {/* NABL Readiness Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card
          title="NABL Readiness Score"
          icon={Target}
          className="lg:col-span-1"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-blue-600">{nablStatus.readinessScore}%</span>
              <Badge variant={nablStatus.readinessScore >= 80 ? 'success' : nablStatus.readinessScore >= 60 ? 'warning' : 'danger'}>
                {nablStatus.phase.charAt(0).toUpperCase() + nablStatus.phase.slice(1)}
              </Badge>
            </div>
            
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${nablStatus.readinessScore}%` }}
              ></div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Next Milestone:</span>
                <span className="font-medium">{nablStatus.nextMilestone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Est. Accreditation:</span>
                <span className="font-medium">{nablStatus.estimatedAccreditationDate}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card
          title="Quality Manual Progress"
          icon={BookOpen}
          className="lg:col-span-2"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Overall Completion</span>
              <span className="font-bold text-slate-800">{qualityManual.overallCompletion}%</span>
            </div>
            
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${qualityManual.overallCompletion}%` }}
              ></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              {qualityManual.sections.map((section, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {section.status === 'completed' && <CheckCircle size={16} className="text-green-600" />}
                    {section.status === 'in_progress' && <Clock size={16} className="text-yellow-600" />}
                    {section.status === 'pending' && <AlertCircle size={16} className="text-slate-400" />}
                    <span className="text-sm font-medium">{section.name}</span>
                  </div>
                  <Badge 
                    variant={
                      section.status === 'completed' ? 'success' : 
                      section.status === 'in_progress' ? 'warning' : 'slate'
                    }
                  >
                    {section.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Proficiency Testing & EQAS */}
      <Card
        title="Proficiency Testing & EQAS"
        subtitle="External Quality Assessment Scheme participation"
        icon={Award}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle size={20} className="text-green-600" />
                <div>
                  <div className="font-bold text-green-800">2</div>
                  <div className="text-xs text-green-600">Completed</div>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock size={20} className="text-blue-600" />
                <div>
                  <div className="font-bold text-blue-800">1</div>
                  <div className="text-xs text-blue-600">Enrolled</div>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle size={20} className="text-yellow-600" />
                <div>
                  <div className="font-bold text-yellow-800">1</div>
                  <div className="text-xs text-yellow-600">Pending</div>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp size={20} className="text-slate-600" />
                <div>
                  <div className="font-bold text-slate-800">93.5%</div>
                  <div className="text-xs text-slate-600">Avg Score</div>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Test Program</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Provider</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Due Date</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Score</th>
                </tr>
              </thead>
              <tbody>
                {proficiencyTests.map((test, index) => (
                  <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium">{test.testName}</td>
                    <td className="py-3 px-4 text-slate-600">{test.provider}</td>
                    <td className="py-3 px-4 text-slate-600">{test.dueDate}</td>
                    <td className="py-3 px-4">
                      <Badge 
                        variant={
                          test.status === 'completed' ? 'success' :
                          test.status === 'enrolled' ? 'info' :
                          test.status === 'overdue' ? 'danger' : 'warning'
                        }
                      >
                        {test.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      {test.score ? (
                        <span className={`font-medium ${test.score >= 90 ? 'text-green-600' : test.score >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {test.score}%
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Internal Audit & Document Control */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Internal Audit Schedule"
          icon={Calendar}
        >
          <div className="space-y-3">
            {auditSchedule.map((audit, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <div className="font-medium text-slate-800">{audit.type}</div>
                  <div className="text-sm text-slate-600">Auditor: {audit.auditor}</div>
                  <div className="text-xs text-slate-500">{audit.date}</div>
                </div>
                <Badge variant={audit.status === 'scheduled' ? 'info' : 'warning'}>
                  {audit.status}
                </Badge>
              </div>
            ))}
            
            <button className="w-full mt-4 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
              Schedule New Audit
            </button>
          </div>
        </Card>

        <Card
          title="Document Control System"
          icon={FileText}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{documentControl.totalDocuments}</div>
                <div className="text-sm text-slate-600">Total Documents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{documentControl.controlledDocuments}</div>
                <div className="text-sm text-slate-600">Controlled</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Pending Review</span>
                <Badge variant="warning">{documentControl.pendingReview}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Overdue Documents</span>
                <Badge variant="danger">{documentControl.overdueDocs}</Badge>
              </div>
            </div>
            
            <div className="pt-3 border-t border-slate-200">
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Document Control Dashboard
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* NABL Requirements Checklist */}
      <Card
        title="NABL ISO 15189:2022 Requirements"
        subtitle="Comprehensive checklist for accreditation readiness"
        icon={CheckCircle}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { category: 'General Requirements', completed: 8, total: 10, color: 'green' },
            { category: 'Structural Requirements', completed: 6, total: 8, color: 'yellow' },
            { category: 'Resource Requirements', completed: 12, total: 15, color: 'yellow' },
            { category: 'Process Requirements', completed: 18, total: 25, color: 'red' },
            { category: 'Management System', completed: 9, total: 12, color: 'yellow' },
            { category: 'Improvement Requirements', completed: 3, total: 6, color: 'red' }
          ].map((req, index) => (
            <div key={index} className="p-4 border border-slate-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-slate-800">{req.category}</h3>
                <Badge variant={req.color === 'green' ? 'success' : req.color === 'yellow' ? 'warning' : 'danger'}>
                  {req.completed}/{req.total}
                </Badge>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    req.color === 'green' ? 'bg-green-600' : 
                    req.color === 'yellow' ? 'bg-yellow-600' : 'bg-red-600'
                  }`}
                  style={{ width: `${(req.completed / req.total) * 100}%` }}
                ></div>
              </div>
              <div className="text-xs text-slate-600 mt-1">
                {Math.round((req.completed / req.total) * 100)}% Complete
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}