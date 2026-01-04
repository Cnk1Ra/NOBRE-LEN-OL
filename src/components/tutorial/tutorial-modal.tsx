'use client'

import { useTutorial } from '@/contexts/tutorial-context'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

export function TutorialModal() {
  const {
    showTutorial,
    currentStep,
    steps,
    nextStep,
    prevStep,
    skipTutorial,
  } = useTutorial()

  const step = steps[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1
  const progress = ((currentStep + 1) / steps.length) * 100

  if (!showTutorial) return null

  return (
    <Dialog open={showTutorial} onOpenChange={(open) => !open && skipTutorial()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 text-5xl">
            {step.icon}
          </div>
          <DialogTitle className="text-xl">{step.title}</DialogTitle>
          <DialogDescription className="text-base pt-2">
            {step.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Passo {currentStep + 1} de {steps.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <DialogFooter className="flex-row gap-2 sm:justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={skipTutorial}
            className="text-muted-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Pular tutorial
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevStep}
              disabled={isFirstStep}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            <Button
              size="sm"
              onClick={nextStep}
            >
              {isLastStep ? (
                'Começar!'
              ) : (
                <>
                  Próximo
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
