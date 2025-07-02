import React, { createContext, useState, ReactNode } from 'react';

// Interface for global variables and state
interface ScriptVariablesContextType {
	globalVariables: Record<string, any>;
	setGlobalVariables: (variables: Record<string, any>) => void;
}

// Create context
export const ScriptVariablesContext = createContext<ScriptVariablesContextType | null>(null);

// Props for provider
interface ScriptVariablesProviderProps {
	children: ReactNode;
	initialGlobalVariables?: Record<string, any>;
}

// Provider component
const ScriptVariablesProvider: React.FC<ScriptVariablesProviderProps> = ({ 
	children, 
	initialGlobalVariables = {} 
}) => {
	const [globalVariables, setGlobalVariables] = useState<Record<string, any>>(initialGlobalVariables);

	return (
		<ScriptVariablesContext.Provider value={{ globalVariables, setGlobalVariables }}>
			{children}
		</ScriptVariablesContext.Provider>
	);
};

export default ScriptVariablesProvider; 