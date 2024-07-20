import {
  useState,
  useEffect,
  ReactNode,
  useContext,
  useMemo,
  lazy,
  Suspense,
} from "react";
import {
  AddButton,
  GreetingHeader,
  GreetingText,
  Offline,
  ProgressPercentageContainer,
  StyledProgress,
  TaskCompletionText,
  TaskCountHeader,
  TaskCountTextContainer,
  TasksCount,
  TasksCountContainer,
} from "../styles";

import {
  displayGreeting,
  getRandomGreeting,
  getTaskCompletionText,
} from "../utils";

import { Box, Tooltip, Typography } from "@mui/material";

import { AddRounded, TodayRounded, WifiOff } from "@mui/icons-material";

import { useUser } from "../contexts/UserContextProvider";
import { useNavigate } from "react-router-dom";
import { TaskContextProvider } from "../contexts/TaskContextProvider";
import Sidebar from "../components/side-bar/SideBar";

const TasksList = lazy(() =>
  import("../components/task/TasksList").then((module) => ({
    default: module.TasksList,
  }))
);

const Home = () => {
  const { user } = useUser();
  const { tasks, name } = user;
  const [randomGreeting, setRandomGreeting] = useState<string | ReactNode>("");
  const [greetingKey, setGreetingKey] = useState<number>(0);
  const [completedTasksCount, setCompletedTasksCount] = useState<number>(0);

  const [tasksWithDeadlineTodayCount, setTasksWithDeadlineTodayCount] =
    useState<number>(0);
  const [tasksDueTodayNames, setTasksDueTodayNames] = useState<string[]>([]);

  const completedTaskPercentage = useMemo<number>(
    () => (completedTasksCount / tasks.length) * 100,
    [completedTasksCount, tasks.length]
  );

  const n = useNavigate();

  useEffect(() => {
    setRandomGreeting(getRandomGreeting());
    document.title = "Todo App";

    const interval = setInterval(() => {
      setRandomGreeting(getRandomGreeting());
      setGreetingKey((prevKey) => prevKey + 1); // Update the key on each interval
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const completedCount = tasks.filter((task) => task.done).length;
    setCompletedTasksCount(completedCount);

    const today = new Date().setHours(0, 0, 0, 0);

    const dueTodayTasks = tasks.filter((task) => {
      if (task.deadline) {
        const taskDeadline = new Date(task.deadline).setHours(0, 0, 0, 0);
        return taskDeadline === today && !task.done;
      }
      return false;
    });

    setTasksWithDeadlineTodayCount(dueTodayTasks.length);

    // Use Intl to format and display task names due today
    const taskNamesDueToday = dueTodayTasks.map((task) => task.name);
    setTasksDueTodayNames(taskNamesDueToday);
  }, [tasks]);

  const replaceEmojiCodes = (text: string): ReactNode[] => {
    const emojiRegex = /\*\*(.*?)\*\*/g;
    const parts = text.split(emojiRegex);

    return parts.map((part, index) => {
      return part;
    });
  };

  const renderGreetingWithEmojis = (text: string | ReactNode) => {
    if (typeof text === "string") {
      return replaceEmojiCodes(text);
    } else {
      // It's already a ReactNode, no need to process
      return text;
    }
  };

  return (
    <>
      <Sidebar />
      <GreetingHeader>
        {displayGreeting()}
        {name && (
          <span translate="no">
            , <span>{name}</span>
          </span>
        )}
      </GreetingHeader>
      <GreetingText key={greetingKey}>
        {renderGreetingWithEmojis(randomGreeting)}
      </GreetingText>

      {tasks.length > 0 && (
        <TasksCountContainer>
          <TasksCount glow={true}>
            <Box sx={{ position: "relative", display: "inline-flex" }}>
              <StyledProgress
                variant="determinate"
                value={completedTaskPercentage}
                size={64}
                thickness={5}
                aria-label="Progress"
                glow={true}
              />

              <ProgressPercentageContainer
                glow={true && completedTaskPercentage > 0}
              >
                <Typography
                  variant="caption"
                  component="div"
                  color="white"
                  sx={{ fontSize: "16px", fontWeight: 600 }}
                >{`${Math.round(completedTaskPercentage)}%`}</Typography>
              </ProgressPercentageContainer>
            </Box>
            <TaskCountTextContainer>
              <TaskCountHeader>
                {completedTasksCount === 0
                  ? `You have ${tasks.length} task${
                      tasks.length > 1 ? "s" : ""
                    } to complete.`
                  : `You've completed ${completedTasksCount} out of ${tasks.length} tasks.`}
              </TaskCountHeader>
              <TaskCompletionText>
                {getTaskCompletionText(completedTaskPercentage)}
              </TaskCompletionText>
              {tasksWithDeadlineTodayCount > 0 && (
                <span
                  style={{
                    opacity: 0.8,
                    display: "inline-block",
                  }}
                >
                  <TodayRounded
                    sx={{ fontSize: "20px", verticalAlign: "middle" }}
                  />
                  &nbsp;Tasks due today:&nbsp;
                  <span translate="no">
                    {new Intl.ListFormat("en", { style: "long" }).format(
                      tasksDueTodayNames
                    )}
                  </span>
                </span>
              )}
            </TaskCountTextContainer>
          </TasksCount>
        </TasksCountContainer>
      )}

      <Suspense fallback={<div>Loading...</div>}>
        <TaskContextProvider>
          <TasksList />
        </TaskContextProvider>
      </Suspense>

      <Tooltip
        title={tasks.length > 0 ? "Add New Task" : "Add Task"}
        placement="left"
      >
        <AddButton
          animate={tasks.length === 0}
          glow={true}
          onClick={() => n("add")}
          aria-label="Add Task"
        >
          <AddRounded style={{ fontSize: "44px" }} />
        </AddButton>
      </Tooltip>
    </>
  );
};

export default Home;
