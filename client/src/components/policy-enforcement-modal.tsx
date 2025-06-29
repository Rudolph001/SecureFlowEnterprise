
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface PolicyViolation {
  policyId: number;
  policyName: string;
  reason: string;
  enforcementMode: "silent" | "warn" | "justify" | "block";
  policyDescription?: string;
  justificationRules?: {
    minLength: number;
    forbiddenPatterns: string[];
    requireBusinessReason: boolean;
  };
}

interface PolicyEnforcementModalProps {
  violation: PolicyViolation | null;
  onClose: () => void;
  onJustificationSubmit?: (justification: string) => void;
  onProceed?: () => void;
}

export default function PolicyEnforcementModal({
  violation,
  onClose,
  onJustificationSubmit,
  onProceed
}: PolicyEnforcementModalProps) {
  const [justification, setJustification] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { toast } = useToast();

  if (!violation) return null;

  const validateJustification = (text: string): string[] => {
    const errors: string[] = [];
    const rules = violation.justificationRules;
    
    if (!rules) return errors;

    // Check minimum length
    if (text.length < rules.minLength) {
      errors.push(`Justification must be at least ${rules.minLength} characters long`);
    }

    // Check forbidden patterns
    const lowerText = text.toLowerCase();
    const forbiddenFound = rules.forbiddenPatterns.filter(pattern => 
      lowerText.includes(pattern.toLowerCase())
    );
    
    if (forbiddenFound.length > 0) {
      errors.push(`Justification cannot contain: ${forbiddenFound.join(", ")}`);
    }

    // Check for business-related keywords if required
    if (rules.requireBusinessReason) {
      const businessKeywords = ["business", "client", "customer", "project", "contract", "meeting", "proposal", "deadline", "requirement"];
      const hasBusinessKeyword = businessKeywords.some(keyword => 
        lowerText.includes(keyword)
      );
      
      if (!hasBusinessKeyword) {
        errors.push("Justification must include business-related context (e.g., client, project, contract, etc.)");
      }
    }

    // Check for obviously garbage input patterns
    const garbagePatterns = [
      /^(.)\1{5,}$/, // Repeated characters (aaaaaa)
      /^[0-9]+$/, // Only numbers
      /^[^a-zA-Z]*$/, // No letters at all
      /^(test|hello|hi|ok|yes|no)$/i, // Common throwaway responses
    ];
    
    if (garbagePatterns.some(pattern => pattern.test(text.trim()))) {
      errors.push("Please provide a meaningful business justification");
    }

    return errors;
  };

  const handleJustificationChange = (text: string) => {
    setJustification(text);
    const errors = validateJustification(text);
    setValidationErrors(errors);
  };

  const handleSubmitJustification = () => {
    const errors = validateJustification(justification);
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      toast({
        title: "Invalid Justification",
        description: "Please address the validation errors below",
        variant: "destructive",
      });
      return;
    }

    onJustificationSubmit?.(justification);
    onClose();
  };

  const getSeverityColor = (mode: string) => {
    switch (mode) {
      case "block": return "bg-red-100 border-red-300 text-red-800";
      case "justify": return "bg-yellow-100 border-yellow-300 text-yellow-800";
      case "warn": return "bg-blue-100 border-blue-300 text-blue-800";
      default: return "bg-gray-100 border-gray-300 text-gray-800";
    }
  };

  const getIcon = (mode: string) => {
    switch (mode) {
      case "block": return "🚫";
      case "justify": return "⚠️";
      case "warn": return "ℹ️";
      default: return "🔍";
    }
  };

  if (violation.enforcementMode === "silent") {
    // Silent mode - this modal shouldn't show, but handle it gracefully
    return null;
  }

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{getIcon(violation.enforcementMode)}</span>
            Security Policy Violation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert className={getSeverityColor(violation.enforcementMode)}>
            <AlertDescription>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{violation.policyName}</span>
                  <Badge variant="outline" className="capitalize">
                    {violation.enforcementMode}
                  </Badge>
                </div>
                <p className="text-sm">{violation.reason}</p>
                {violation.policyDescription && (
                  <p className="text-xs mt-2 p-2 bg-white/50 rounded border">
                    <strong>Policy Details:</strong> {violation.policyDescription}
                  </p>
                )}
              </div>
            </AlertDescription>
          </Alert>

          {violation.enforcementMode === "justify" && (
            <div className="space-y-3">
              <Label htmlFor="justification" className="text-base font-medium">
                Business Justification Required
              </Label>
              <Textarea
                id="justification"
                value={justification}
                onChange={(e) => handleJustificationChange(e.target.value)}
                placeholder="Please provide a detailed business justification for this action. Explain why this is necessary for business operations..."
                className="min-h-[100px]"
              />
              
              {validationErrors.length > 0 && (
                <div className="space-y-1">
                  {validationErrors.map((error, index) => (
                    <p key={index} className="text-sm text-red-600 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                      {error}
                    </p>
                  ))}
                </div>
              )}

              <div className="text-xs text-gray-500 space-y-1">
                <p>Requirements:</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Minimum {violation.justificationRules?.minLength || 20} characters</li>
                  {violation.justificationRules?.requireBusinessReason && (
                    <li>Must include business context</li>
                  )}
                  <li>No generic responses (e.g., "test", "123", etc.)</li>
                </ul>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t">
            {violation.enforcementMode === "block" ? (
              <Button onClick={onClose} variant="outline">
                Understood
              </Button>
            ) : violation.enforcementMode === "justify" ? (
              <>
                <Button onClick={onClose} variant="outline">
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitJustification}
                  disabled={validationErrors.length > 0 || !justification.trim()}
                >
                  Submit Justification & Proceed
                </Button>
              </>
            ) : (
              <>
                <Button onClick={onClose} variant="outline">
                  Cancel
                </Button>
                <Button onClick={() => { onProceed?.(); onClose(); }}>
                  Proceed Anyway
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
