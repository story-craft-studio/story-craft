import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Tab,
  Tabs,
  Box,
  Typography,
  Paper,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CodeIcon from "@mui/icons-material/Code";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import { useComponentTranslation } from "../../../../util/translation-wrapper";
import { styled } from "@mui/material/styles";

// Styled components for consistent theming
const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    borderRadius: 10,
    boxShadow: theme.shadows[10],
    maxWidth: "900px",
    background: theme.palette.background.default,
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: "none",
  fontWeight: 600,
  fontSize: "1rem",
  padding: theme.spacing(1.5, 3),
  "&.Mui-selected": {
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.background.paper,
    borderBottom: `2px solid ${theme.palette.primary.main}`,
  },
  transition: theme.transitions.create(["color", "background-color"], {
    duration: theme.transitions.duration.short,
  }),
}));

const StyledCard = styled(Paper)(({ theme }) => ({
  borderRadius: 10,
  background: theme.palette.background.paper,
  transition: theme.transitions.create(["transform", "box-shadow"], {
    duration: theme.transitions.duration.short,
  }),
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[6],
  },
  overflow: "hidden",
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`script-help-tabpanel-${index}`}
      aria-labelledby={`script-help-tab-${index}`}
      style={{ maxHeight: "70vh", overflow: "auto" }}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 4, bgcolor: "background.default" }}>{children}</Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `script-help-tab-${index}`,
    "aria-controls": `script-help-tabpanel-${index}`,
  };
}

interface CommandInfoProps {
  command: string;
  description: string;
  example: string;
  bgColor: string;
}

const CommandInfo: React.FC<CommandInfoProps> = ({
  command,
  description,
  example,
  bgColor,
}) => {
  const theme = useTheme();
  return (
    <StyledCard elevation={2} sx={{ mb: 3 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          bgcolor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          p: 1.5,
          pl: 2,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
        }}
      >
        <CodeIcon fontSize="small" />
        <Typography variant="subtitle1" sx={{ ml: 1.5, fontWeight: 600 }}>
          {command}
        </Typography>
      </Box>
      <Box sx={{ p: 2.5, bgcolor: bgColor }}>
        <Typography
          variant="body1"
          sx={{ mb: 2, color: theme.palette.text.secondary }}
        >
          {description}
        </Typography>
        <Box
          sx={{
            bgcolor: theme.palette.grey[100],
            p: 2,
            borderRadius: 6,
            position: "relative",
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              position: "absolute",
              top: -12,
              left: 12,
              bgcolor: theme.palette.background.paper,
              px: 1,
              borderRadius: 4,
              fontSize: "0.75rem",
              color: theme.palette.text.secondary,
              fontWeight: 500,
            }}
          >
            Example
          </Typography>
          <code
            style={{
              fontSize: "0.9rem",
              whiteSpace: "pre-wrap",
              color: theme.palette.text.primary,
            }}
          >
            {example}
          </code>
        </Box>
      </Box>
    </StyledCard>
  );
};

interface CodeExampleProps {
  title: string;
  code: string;
  icon: React.ReactNode;
}

const CodeExample: React.FC<CodeExampleProps> = ({ title, code, icon }) => {
  const theme = useTheme();
  return (
    <StyledCard elevation={2} sx={{ mb: 3 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          bgcolor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          p: 1.5,
          pl: 2,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
        }}
      >
        {icon}
        <Typography variant="subtitle1" sx={{ ml: 1.5, fontWeight: 600 }}>
          {title}
        </Typography>
      </Box>
      <Box sx={{ p: 2.5, bgcolor: theme.palette.grey[50] }}>
        <pre
          style={{
            margin: 0,
            padding: 16,
            backgroundColor: theme.palette.grey[100],
            borderRadius: 6,
            overflow: "auto",
            fontSize: "0.9rem",
            lineHeight: 1.6,
            color: theme.palette.text.primary,
          }}
        >
          {code}
        </pre>
      </Box>
    </StyledCard>
  );
};

interface ScriptHelpGuideProps {
  open: boolean;
  onClose: () => void;
  initialTab?: number;
  globalVariables: Record<string, any>;
}

const ScriptHelpGuide: React.FC<ScriptHelpGuideProps> = ({
  open,
  onClose,
  initialTab = 0,
  globalVariables,
}) => {
  const [tabValue, setTabValue] = useState(initialTab);
  const { t } = useComponentTranslation("scriptCommandBlock");
  const theme = useTheme();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const commandColors = [
    "#e3f2fd", // SET - Light blue
    "#e8f5e9", // ADD - Light green
    "#fff3e0", // SUB - Light orange
    "#f3e5f5", // IF - Light purple
    "#e0f7fa", // GOTO - Light cyan
    "#fce4ec", // BEGIN/END - Light pink
    "#f1f8e9", // Comments - Light green
  ];

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{ backdropFilter: "blur(4px)" }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          bgcolor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          p: 2,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
        }}
      >
        <CodeIcon sx={{ mr: 1.5, fontSize: 28 }} />
        <Typography
          variant="h5"
          component="div"
          sx={{ flexGrow: 1, fontWeight: 700 }}
        >
          {t("scriptGuideTitle", "Script Command Guide")}
        </Typography>
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
          sx={{
            "&:hover": {
              bgcolor: theme.palette.primary.dark,
              transform: "rotate(90deg)",
              transition: theme.transitions.create(["transform", "background"], {
                duration: theme.transitions.duration.short,
              }),
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Box sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "background.paper" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="script help tabs"
          variant="fullWidth"
          sx={{
            "& .MuiTabs-indicator": {
              backgroundColor: theme.palette.primary.main,
              height: 3,
            },
          }}
        >
          <StyledTab
            icon={<CodeIcon />}
            label={t("commandsTab", "Commands")}
            {...a11yProps(0)}
          />
          <StyledTab
            icon={<MenuBookIcon />}
            label={t("syntaxTab", "Syntax")}
            {...a11yProps(1)}
          />
          <StyledTab
            icon={<FormatListNumberedIcon />}
            label={t("examplesTab", "Examples")}
            {...a11yProps(2)}
          />
        </Tabs>
      </Box>
      <DialogContent sx={{ p: 0, bgcolor: "background.default" }}>
        <TabPanel value={tabValue} index={0}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              mb: 3,
            }}
          >
            <CodeIcon sx={{ mr: 1.5, fontSize: 24 }} />
            {t("availableCommands", "Available commands:")}
          </Typography>
          <CommandInfo
            command="SET @varName = value;"
            description={t("setCmdDescription", "Set a variable to a value")}
            example={t("setCmdExample", "set @health = 100;")}
            bgColor={commandColors[0]}
          />
          <CommandInfo
            command="ADD @varName = value;"
            description={t("addCmdDescription", "Add a value to a variable")}
            example={t("addCmdExample", "add @score = 10;")}
            bgColor={commandColors[1]}
          />
          <CommandInfo
            command="SUB @varName = value;"
            description={t("subCmdDescription", "Subtract a value from a variable")}
            example={t("subCmdExample", "sub @health = 5;")}
            bgColor={commandColors[2]}
          />
          <CommandInfo
            command="IF @condition THEN command;"
            description={t("ifCmdDescription", "Conditional execution")}
            example={t("ifCmdExample", "if @score >= 100 then goto 'Win';")}
            bgColor={commandColors[3]}
          />
          <CommandInfo
            command="GOTO passageName;"
            description={t("gotoCmdDescription", "Jump to another passage")}
            example={t("gotoCmdExample", "goto 'Forest Path';")}
            bgColor={commandColors[4]}
          />
          <CommandInfo
            command="BEGIN ... END;"
            description={t(
              "blockCmdDescription",
              "Group multiple commands together"
            )}
            example={t(
              "blockCmdExample",
              "if @hasKey == true then begin\n  set @hasKey = false;\n  goto 'Secret Room';\nend;"
            )}
            bgColor={commandColors[5]}
          />
          <CommandInfo
            command="// comment"
            description={t("commentCmdDescription", "Add a comment line (ignored)")}
            example={t("commentCmdExample", "// This gives player extra health")}
            bgColor={commandColors[6]}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ fontWeight: 700, display: "flex", alignItems: "center", mb: 4 }}
          >
            <MenuBookIcon sx={{ mr: 1.5, fontSize: 24 }} />
            {t("syntaxTab", "Syntax")}
          </Typography>

          {/* Value Types Section */}
          <StyledCard elevation={2} sx={{ mb: 4 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                bgcolor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                p: 1.5,
                pl: 2,
                borderTopLeftRadius: 10,
                borderTopRightRadius: 10,
              }}
            >
              <MenuBookIcon fontSize="small" />
              <Typography variant="subtitle1" sx={{ ml: 1.5, fontWeight: 600 }}>
                {t("valueTypes", "Value Types")}
              </Typography>
            </Box>
            <Box sx={{ p: 3, bgcolor: theme.palette.grey[50] }}>
              <Typography
                variant="body1"
                sx={{ mb: 2, color: theme.palette.text.secondary }}
              >
                {t(
                  "valueTypesDescription",
                  "Data types you can use in scripts:"
                )}
              </Typography>
              {[
                {
                  type: "numbers",
                  description: t(
                    "numbersDescription",
                    "Whole or decimal numbers for calculations"
                  ),
                  examples: ["1", "42", "100.5"],
                },
                {
                  type: "booleans",
                  description: t(
                    "booleansDescription",
                    "True or false values for conditions"
                  ),
                  examples: ["true", "false"],
                },
                {
                  type: "strings",
                  description: t(
                    "stringsDescription",
                    "Text values enclosed in single quotes"
                  ),
                  examples: ["'text'", "'with spaces'"],
                },
                {
                  type: "variables",
                  description: t(
                    "variablesDescription",
                    "Named values defined in your script, starting with @ symbol"
                  ),
                  examples: ["@score", "@health", "@playerName"],
                },
              ].map((item, index) => (
                <Box key={index} sx={{ mb: 3, pl: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                        mr: 1,
                      }}
                    >
                      <code>{item.type}</code>
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: theme.palette.text.secondary }}
                    >
                      {item.description}
                    </Typography>
                  </Box>
                  <Box sx={{ pl: 2 }}>
                    <Typography
                      variant="caption"
                      sx={{ color: theme.palette.text.secondary, mb: 1 }}
                    >
                      {t("examples", "Examples:")}
                    </Typography>
                    {item.examples.map((example, i) => (
                      <Typography
                        key={i}
                        variant="body2"
                        sx={{
                          display: "list-item",
                          ml: 2,
                          color: theme.palette.text.primary,
                        }}
                      >
                        {example}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>
          </StyledCard>

          {/* Operators Section */}
          <StyledCard elevation={2} sx={{ mb: 4 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                bgcolor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                p: 1.5,
                pl: 2,
                borderTopLeftRadius: 10,
                borderTopRightRadius: 10,
              }}
            >
              <MenuBookIcon fontSize="small" />
              <Typography variant="subtitle1" sx={{ ml: 1.5, fontWeight: 600 }}>
                {t("operators", "Operators")}
              </Typography>
            </Box>
            <Box sx={{ p: 3, bgcolor: theme.palette.grey[50] }}>
              <Typography
                variant="body1"
                sx={{ mb: 2, color: theme.palette.text.secondary }}
              >
                {t(
                  "operatorsDescription",
                  "Symbols for operations and comparisons in scripts:"
                )}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {[
                  {
                    operator: "=",
                    description: t("assignmentOp", "Assigns a value to a variable"),
                    example: "set @score = 10;",
                  },
                  {
                    operator: "==",
                    description: t("equalityOp", "Checks if two values are equal"),
                    example: "if @score == 10 then...",
                  },
                  {
                    operator: "!=",
                    description: t("inequalityOp", "Checks if two values are not equal"),
                    example: "if @health != 0 then...",
                  },
                  {
                    operator: ">, <, >=, <=",
                    description: t("comparisonOp", "Compares numbers or variables"),
                    example: "if @score >= 100 then...",
                  },
                ].map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      pl: 1,
                      py: 1,
                      borderBottom:
                        index < 3 ? `1px solid ${theme.palette.divider}` : "none",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        width: 120,
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                      }}
                    >
                      <code>{item.operator}</code>
                    </Typography>
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ color: theme.palette.text.secondary, mb: 0.5 }}
                      >
                        {item.description}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: theme.palette.text.primary }}
                      >
                        {t("example", "Example:")} {item.example}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </StyledCard>

        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ fontWeight: 700, display: "flex", alignItems: "center", mb: 3 }}
          >
            <FormatListNumberedIcon sx={{ mr: 1.5, fontSize: 24 }} />
            {t("scriptPatterns", "Common Script Patterns:")}
          </Typography>

          <CodeExample
            title={t("conditionCheck", "Check if player has an item")}
            code={`if @hasKey == true then begin
  set @hasKey = false;
  goto 'Secret Room';
end;`}
            icon={<SportsEsportsIcon fontSize="small" />}
          />

          <CodeExample
            title={t("rewardPlayer", "Reward player with points")}
            code={`// Give reward for completing quest
add @score = 50;
set @questCompleted = true;`}
            icon={<SportsEsportsIcon fontSize="small" />}
          />

          <CodeExample
            title={t("combatExample", "Simple combat example")}
            code={`// Player takes damage
sub @health = 10;
if @health <= 0 then goto 'Game Over';`}
            icon={<SportsEsportsIcon fontSize="small" />}
          />

          <CodeExample
            title={t("inventoryExample", "Inventory management")}
            code={`// Example assuming inventory is an array variable
if @hasKey == false then begin
  set @hasKey = true;
  // Show message to player that they found a key
end;`}
            icon={<SportsEsportsIcon fontSize="small" />}
          />

          <CodeExample
            title={t("multipleConditions", "Nested conditions")}
            code={`if @score >= 100 then begin
  if @health > 50 then begin
    // Player is doing well
    goto 'Victory Path';
  end;
  // Player has points but low health
  goto 'Survival Path';
end;`}
            icon={<SportsEsportsIcon fontSize="small" />}
          />
        </TabPanel>
      </DialogContent>
    </StyledDialog>
  );
};

export default ScriptHelpGuide;