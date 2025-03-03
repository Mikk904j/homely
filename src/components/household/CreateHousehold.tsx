
import { SuccessScreen } from "./SuccessScreen";
import { CreateHouseholdCard } from "./CreateHouseholdCard";
import { useCreateHousehold } from "@/hooks/use-create-household";

interface CreateHouseholdProps {
  onBack: () => void;
}

export const CreateHousehold = ({ onBack }: CreateHouseholdProps) => {
  const {
    householdName,
    setHouseholdName,
    householdTheme,
    setHouseholdTheme,
    isLoading,
    step,
    inviteCode,
    handleCreateHousehold,
    handleContinue
  } = useCreateHousehold();

  if (step === 'success') {
    return (
      <SuccessScreen 
        householdName={householdName}
        inviteCode={inviteCode}
        onContinue={handleContinue}
      />
    );
  }

  return (
    <div className="container max-w-lg mx-auto pt-8 px-4">
      <CreateHouseholdCard 
        householdName={householdName}
        setHouseholdName={setHouseholdName}
        householdTheme={householdTheme}
        setHouseholdTheme={setHouseholdTheme}
        isLoading={isLoading}
        onSubmit={handleCreateHousehold}
        onBack={onBack}
      />
    </div>
  );
};
