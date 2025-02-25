import { useTheme } from "@emotion/react";
import {
  CancelRounded,
  Close,
  Delete,
  DeleteRounded,
  DoneAll,
  DoneRounded,
  Link,
  MoreVert,
  PushPinRounded,
  RadioButtonChecked,
  Search,
} from "@mui/icons-material";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Tooltip,
} from "@mui/material";

import { useCallback, useContext, useEffect, useMemo, useState } from "react";
// import {  TaskIcon, TaskMenu } from "..";
import { EditTask } from "../edit-task/EditTask";

import { URL_REGEX } from "../constants/constants";
import { useTasks } from "../../contexts/TaskContextProvider";
import { useStorageState } from "../../hooks/useStorageState";
import { DialogBtn } from "../../styles/common.styled";

import { Category, Task, UUID } from "../../types/User";
import { calculateDateDifference } from "../../utils/calculateTimeDiff";
import { formatDate } from "../../utils/formatDate";
import { RenderTaskDescription } from "./RenderTaskDescription";
import {
  CategoriesListContainer,
  EmojiContainer,
  NoTasks,
  Pinned,
  RadioChecked,
  RadioUnchecked,
  RingAlarm,
  SearchClear,
  SearchInput,
  SelectedTasksContainer,
  StyledRadio,
  TaskContainer,
  TaskDate,
  TaskDescription,
  TaskHeader,
  TaskInfo,
  TaskName,
  TasksContainer,
  TimeLeft,
} from "./tasks.styled";
import { useUser } from "../../contexts/UserContextProvider";
import { TaskMenu } from "./TaskMenu";
import { deleteTask, updateTask } from "../../apis/api";

/**
 * Component to display a list of tasks.
 */

export const TasksList: React.FC = () => {
  const { user, setUser } = useUser();
  const {
    selectedTaskId,
    setSelectedTaskId,
    anchorEl,
    setAnchorEl,
    setAnchorPosition,
    expandedTasks,
    toggleShowMore,
    search,
    setSearch,
    highlightMatchingText,
    multipleSelectedTasks,
    setMultipleSelectedTasks,
    handleSelectTask,
    editModalOpen,
    setEditModalOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
  } = useTasks();
  const open = Boolean(anchorEl);

  const [deleteSelectedOpen, setDeleteSelectedOpen] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[] | undefined>(
    undefined
  );
  const [selectedCatId, setSelectedCatId] = useStorageState<UUID | undefined>(
    undefined,
    "selectedCategory",
    "sessionStorage"
  );
  const [categoryCounts, setCategoryCounts] = useState<{
    [categoryId: UUID]: number;
  }>({});

  const listFormat = useMemo(
    () =>
      new Intl.ListFormat("en-US", {
        style: "long",
        type: "conjunction",
      }),
    []
  );

  const selectedTask = useMemo(() => {
    return (
      user.tasks.find((task) => task.id === selectedTaskId) || ({} as Task)
    );
  }, [user.tasks, selectedTaskId]);

  // Handler for clicking the more options button in a task
  const handleClick = (event: React.MouseEvent<HTMLElement>, taskId: UUID) => {
    setAnchorEl(event.currentTarget);
    setSelectedTaskId(taskId);
    const target = event.target as HTMLElement;
    // Position the menu where the click event occurred
    if (target.tagName !== "BUTTON") {
      setAnchorPosition({
        top: event.clientY,
        left: event.clientX,
      });
    } else {
      setAnchorPosition(null);
    }
    if (!expandedTasks.has(taskId)) {
      toggleShowMore(taskId);
    }
  };

  const reorderTasks = useCallback(
    (tasks: Task[]): Task[] => {
      // Separate tasks into pinned and unpinned
      let pinnedTasks = tasks.filter((task) => task.pinned);
      let unpinnedTasks = tasks.filter((task) => !task.pinned);

      // Filter tasks based on the selected category
      if (selectedCatId !== undefined) {
        const categoryFilter = (task: Task) =>
          task.category?.some((category) => category.id === selectedCatId) ??
          false;
        unpinnedTasks = unpinnedTasks.filter(categoryFilter);
        pinnedTasks = pinnedTasks.filter(categoryFilter);
      }

      // Filter tasks based on the search input
      const searchLower = search.toLowerCase();
      const searchFilter = (task: Task) =>
        task.name.toLowerCase().includes(searchLower) ||
        (task.description &&
          task.description.toLowerCase().includes(searchLower));
      unpinnedTasks = unpinnedTasks.filter(searchFilter);
      pinnedTasks = pinnedTasks.filter(searchFilter);

      // Move done tasks to bottom if the setting is enabled
      if (true) {
        const doneTasks = unpinnedTasks.filter((task) => task.done);
        const notDoneTasks = unpinnedTasks.filter((task) => !task.done);
        return [...pinnedTasks, ...notDoneTasks, ...doneTasks];
      }

      return [...pinnedTasks, ...unpinnedTasks];
    },
    [search, selectedCatId]
  );

  const confirmDeleteTask = async () => {
    // Deletes the selected task

    if (selectedTaskId) {
      await deleteTask(selectedTaskId);

      const updatedTasks = user.tasks.filter(
        (task) => task.id !== selectedTaskId
      );
      setUser((prevUser) => ({
        ...prevUser,
        tasks: updatedTasks,
      }));

      setDeleteDialogOpen(false);
    }
  };
  const cancelDeleteTask = () => {
    // Cancels the delete task operation
    setDeleteDialogOpen(false);
  };

  const handleMarkSelectedAsDone = () => {
    setUser((prevUser) => ({
      ...prevUser,
      tasks: prevUser.tasks.map((task) => {
        if (multipleSelectedTasks.includes(task.id)) {
          // Mark the task as done if selected
          return { ...task, done: true };
        }
        return task;
      }),
    }));
    // Clear the selected task IDs after the operation
    setMultipleSelectedTasks([]);
  };

  const handleDeleteSelected = () => setDeleteSelectedOpen(true);

  useEffect(() => {
    const tasks: Task[] = reorderTasks(user.tasks);
    const uniqueCategories: Category[] = [];

    tasks.forEach((task) => {
      if (task.category) {
        task.category.forEach((category) => {
          if (!uniqueCategories.some((c) => c.id === category.id)) {
            uniqueCategories.push(category);
          }
        });
      }
    });

    // Calculate category counts
    const counts: { [categoryId: UUID]: number } = {};
    uniqueCategories.forEach((category) => {
      const categoryTasks = tasks.filter((task) =>
        task.category?.some((cat) => cat.id === category.id)
      );
      counts[category.id] = categoryTasks.length;
    });

    // Sort categories based on count
    uniqueCategories.sort((a, b) => {
      const countA = counts[a.id] || 0;
      const countB = counts[b.id] || 0;
      return countB - countA;
    });

    setCategories(uniqueCategories);
    setCategoryCounts(counts);
  }, [user.tasks, search, reorderTasks, setCategories, setCategoryCounts]);

  const checkOverdueTasks = useCallback(
    (tasks: Task[]) => {
      const overdueTasks = tasks.filter((task) => {
        return (
          task.deadline && new Date() > new Date(task.deadline) && !task.done
        );
      });
    },
    [listFormat, user]
  );

  useEffect(() => {
    checkOverdueTasks(user.tasks);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <TaskMenu />
      <TasksContainer>
        {user.tasks.length > 0 && (
          <SearchInput
            focused
            color="primary"
            placeholder="Search for task..."
            autoComplete="off"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "black" }} />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <SearchClear
                    color={
                      reorderTasks(user.tasks).length === 0 &&
                      user.tasks.length > 0
                        ? "error"
                        : "default"
                    }
                    onClick={() => setSearch("")}
                  >
                    <Close
                      sx={{
                        color:
                          reorderTasks(user.tasks).length === 0 &&
                          user.tasks.length > 0
                            ? `red !important`
                            : "white",
                        transition: ".3s all",
                      }}
                    />
                  </SearchClear>
                </InputAdornment>
              ) : undefined,
            }}
          />
        )}
        {/* {categories !== undefined && categories?.length > 0 && (
          <CategoriesListContainer>
            {categories?.map((cat) => (
              <CategoryBadge
                key={cat.id}
                category={cat}
                emojiSizes={[24, 20]}
                list={"true"}
                label={
                  <div>
                    <span style={{ fontWeight: "bold" }}>{cat.name}</span>
                    <span
                      style={{
                        fontSize: "14px",
                        opacity: 0.9,
                        marginLeft: "4px",
                      }}
                    >
                      ({categoryCounts[cat.id]})
                    </span>
                  </div>
                }
                onClick={() =>
                  selectedCatId !== cat.id
                    ? setSelectedCatId(cat.id)
                    : setSelectedCatId(undefined)
                }
                onDelete={
                  selectedCatId === cat.id
                    ? () => setSelectedCatId(undefined)
                    : undefined
                }
                sx={{
                  boxShadow: "none",
                  display:
                    selectedCatId === undefined || selectedCatId === cat.id
                      ? "inline-flex"
                      : "none",
                  p: "20px 14px",
                  fontSize: "16px",
                }}
              />
            ))}
          </CategoriesListContainer>
        )} */}
        {multipleSelectedTasks.length > 0 && (
          <SelectedTasksContainer>
            <div>
              <h3>
                <RadioButtonChecked /> &nbsp; Selected{" "}
                {multipleSelectedTasks.length} task
                {multipleSelectedTasks.length > 1 ? "s" : ""}
              </h3>
              <span translate="no" style={{ fontSize: "14px", opacity: 0.8 }}>
                {listFormat.format(
                  multipleSelectedTasks
                    .map(
                      (taskId) =>
                        user.tasks.find((task) => task.id === taskId)?.name
                    )
                    .filter((taskName) => taskName !== undefined) as string[]
                )}
              </span>
            </div>
            {/* TODO: add more features */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Tooltip title="Mark selected as done">
                <IconButton
                  sx={{ color: "red" }}
                  size="large"
                  onClick={handleMarkSelectedAsDone}
                >
                  <DoneAll />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete selected">
                <IconButton
                  color="error"
                  size="large"
                  onClick={handleDeleteSelected}
                >
                  <Delete />
                </IconButton>
              </Tooltip>
              <Tooltip sx={{ color: "red" }} title="Cancel">
                <IconButton
                  size="large"
                  onClick={() => setMultipleSelectedTasks([])}
                >
                  <CancelRounded />
                </IconButton>
              </Tooltip>
            </div>
          </SelectedTasksContainer>
        )}
        {search &&
          reorderTasks(user.tasks).length > 1 &&
          user.tasks.length > 0 && (
            <div
              style={{
                textAlign: "center",
                fontSize: "18px",
                opacity: 0.9,
                marginTop: "12px",
              }}
            >
              <b>
                Found {reorderTasks(user.tasks).length} task
                {reorderTasks(user.tasks).length > 1 ? "s" : ""}
              </b>
            </div>
          )}
        {user.tasks.length !== 0 ? (
          reorderTasks(user.tasks).map((task) => (
            <TaskContainer
              key={task.id}
              id={task.id.toString()}
              // open the task menu on right click
              onContextMenu={(e) => {
                e.preventDefault();
                handleClick(e, task.id);
              }}
              backgroundColor={task.color}
              glow={true}
              done={task.done}
              blur={selectedTaskId !== task.id && open}
            >
              {multipleSelectedTasks.length > 0 && (
                <StyledRadio
                  clr={"red"}
                  checked={multipleSelectedTasks.includes(task.id)}
                  icon={<RadioUnchecked />}
                  checkedIcon={<RadioChecked />}
                  onChange={() => {
                    if (multipleSelectedTasks.includes(task.id)) {
                      setMultipleSelectedTasks((prevTasks) =>
                        prevTasks.filter((id) => id !== task.id)
                      );
                    } else {
                      handleSelectTask(task.id);
                    }
                  }}
                />
              )}

              <TaskInfo translate="no">
                <TaskHeader>
                  <TaskName done={task.done}>
                    {highlightMatchingText(task.name)}
                  </TaskName>
                  <Tooltip
                    title={new Intl.DateTimeFormat(navigator.language, {
                      dateStyle: "full",
                      timeStyle: "medium",
                    }).format(new Date(task.date))}
                  >
                    <TaskDate>{formatDate(new Date(task.date))}</TaskDate>
                  </Tooltip>
                </TaskHeader>

                <TaskDescription done={task.done}>
                  <RenderTaskDescription task={task} />
                </TaskDescription>

                {task.deadline && (
                  <Tooltip
                    title={new Intl.DateTimeFormat(navigator.language, {
                      dateStyle: "full",
                      timeStyle: "medium",
                    }).format(new Date(task.deadline))}
                    placement="bottom-start"
                  >
                    <TimeLeft done={task.done} translate="yes">
                      <RingAlarm
                        fontSize="small"
                        animate={
                          new Date() > new Date(task.deadline) && !task.done
                        }
                        sx={{
                          color: `red !important`,
                        }}
                      />{" "}
                      &nbsp;
                      {new Date(task.deadline).toLocaleDateString()} {" • "}
                      {new Date(task.deadline).toLocaleTimeString()}
                      {!task.done && (
                        <>
                          {" • "}
                          {calculateDateDifference(new Date(task.deadline))}
                        </>
                      )}
                    </TimeLeft>
                  </Tooltip>
                )}

                {/* <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "4px 6px",
                    justifyContent: "left",
                    alignItems: "center",
                  }}
                >
                  {task.category &&
                    task.category.map((category) => (
                      <div key={category.id}>
                        <CategoryBadge
                          category={category}
                          borderclr={getFontColor(task.color)}
                        />
                      </div>
                    ))}
                </div> */}
              </TaskInfo>
              <IconButton
                aria-label="Task Menu"
                aria-controls={open ? "task-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
                onClick={(event) => handleClick(event, task.id)}
                sx={{ color: "red" }}
              >
                <MoreVert />
              </IconButton>
            </TaskContainer>
          ))
        ) : (
          <NoTasks>
            <b>You don't have any tasks yet</b>
            <br />
            Click on the <b>+</b> button to add one
          </NoTasks>
        )}
        {search &&
          reorderTasks(user.tasks).length === 0 &&
          user.tasks.length > 0 && (
            <div
              style={{
                textAlign: "center",
                fontSize: "20px",
                opacity: 0.9,
                marginTop: "18px",
              }}
            >
              <b>No tasks found</b>
              <br />
              Try searching with different keywords.
              {/* <div style={{ marginTop: "14px" }}>
                <TaskIcon scale={0.8} />
              </div> */}
            </div>
          )}
        <EditTask
          open={editModalOpen}
          task={user.tasks.find((task) => task.id === selectedTaskId)}
          onClose={() => setEditModalOpen(false)}
          onSave={async (editedTask: Task) => {
            await updateTask(editedTask.id, {
              name: editedTask.name,
              description: editedTask.description,
              completed: editedTask.completed,
              date: new Date(editedTask.date).toISOString().split("T")[0],
              deadline:
                editedTask.deadline !== undefined
                  ? new Date(editedTask.deadline).toISOString().split("T")[0]
                  : undefined,
            });
            const updatedTasks = user.tasks.map((task) => {
              if (task.id === editedTask.id) {
                return {
                  ...task,
                  name: editedTask.name,
                  color: editedTask.color,
                  emoji: editedTask.emoji || undefined,
                  description: editedTask.description || undefined,
                  deadline: editedTask.deadline || undefined,
                  category: editedTask.category || undefined,
                  lastSave: new Date(),
                };
              }
              return task;
            });
            setUser((prevUser) => ({
              ...prevUser,
              tasks: updatedTasks,
            }));
            setEditModalOpen(false);
          }}
        />
      </TasksContainer>
      <Dialog open={deleteDialogOpen} onClose={cancelDeleteTask}>
        <DialogTitle>Are you sure you want to delete the task?</DialogTitle>
        <DialogContent>
          {selectedTask !== undefined && (
            <>
              {selectedTask.emoji && (
                <p
                  style={{
                    display: "flex",
                    justifyContent: "left",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <b>Emoji:</b>{" "}
                  {/* <Emoji
                    size={28}
                    emojiStyle={EmojiStyle.APPLE}
                    unified={selectedTask.emoji}
                  /> */}
                </p>
              )}
              <p>
                <b>Task Name:</b>{" "}
                <span translate="no">{selectedTask.name}</span>
              </p>
              {selectedTask.description && (
                <p>
                  <b>Task Description:</b>{" "}
                  <span translate="no">
                    {selectedTask.description.replace(URL_REGEX, "[link]")}
                  </span>
                </p>
              )}
              {selectedTask.category?.[0]?.name && (
                <p>
                  <b>
                    {selectedTask.category.length > 1
                      ? "Categories"
                      : "Category"}
                    :
                  </b>{" "}
                  <span translate="no">
                    {listFormat.format(
                      selectedTask.category.map((cat) => cat.name)
                    )}
                  </span>
                </p>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <DialogBtn onClick={cancelDeleteTask} color="primary">
            Cancel
          </DialogBtn>
          <DialogBtn onClick={confirmDeleteTask} color="error">
            <DeleteRounded /> &nbsp; Delete
          </DialogBtn>
        </DialogActions>
      </Dialog>
      <Dialog open={deleteSelectedOpen}>
        <DialogTitle>
          Are you sure you want to delete selected tasks?
        </DialogTitle>
        <DialogContent translate="no">
          {listFormat.format(
            multipleSelectedTasks
              .map(
                (taskId) => user.tasks.find((task) => task.id === taskId)?.name
              )
              .filter((taskName) => taskName !== undefined) as string[]
          )}
        </DialogContent>
        <DialogActions>
          <DialogBtn
            onClick={() => setDeleteSelectedOpen(false)}
            color="primary"
          >
            Cancel
          </DialogBtn>
          <DialogBtn
            onClick={async () => {
              await Promise.all(
                multipleSelectedTasks.map((taskId) => deleteTask(taskId))
              );
              setUser((prevUser) => ({
                ...prevUser,
                tasks: prevUser.tasks.filter(
                  (task) => !multipleSelectedTasks.includes(task.id)
                ),
              }));
              // Clear the selected task IDs after the operation
              setMultipleSelectedTasks([]);
              setDeleteSelectedOpen(false);
            }}
            color="error"
          >
            Delete
          </DialogBtn>
        </DialogActions>
      </Dialog>
    </>
  );
};
