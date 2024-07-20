import styled from "@emotion/styled";
import {
  AddRounded,
  AdjustRounded,
  BugReportRounded,
  CategoryRounded,
  DeleteForeverRounded,
  Favorite,
  FavoriteRounded,
  FiberManualRecord,
  GetAppRounded,
  GitHub,
  InstallDesktopRounded,
  InstallMobileRounded,
  IosShareRounded,
  Logout,
  PhoneIphoneRounded,
  SettingsRounded,
  StarRounded,
  TaskAltRounded,
} from "@mui/icons-material";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  SwipeableDrawer,
  Tooltip,
} from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { defaultUser } from "../../contexts/UserContextProvider";
import { useUser } from "../../contexts/UserContextProvider";
import { DialogBtn, UserAvatar, pulseAnimation, ring } from "../../styles";
import { timeAgo } from "../../utils";

export const SideBar = () => {
  const { user, setUser } = useUser();
  const { name, tasks } = user;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [logoutConfirmationOpen, setLogoutConfirmationOpen] =
    useState<boolean>(false);

  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const n = useNavigate();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutConfirmationOpen = () => {
    setLogoutConfirmationOpen(true);
    setAnchorEl(null);
  };

  const handleLogoutConfirmationClose = () => {
    setLogoutConfirmationOpen(false);
  };

  const handleLogout = () => {
    setUser(defaultUser);
    handleLogoutConfirmationClose();
  };

  interface BeforeInstallPromptEvent extends Event {
    readonly platforms: ReadonlyArray<string>;
    readonly userChoice: Promise<{
      outcome: "accepted" | "dismissed";
      platform: string;
    }>;
    prompt(): Promise<void>;
  }

  const [supportsPWA, setSupportsPWA] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isAppInstalled, setIsAppInstalled] = useState<boolean>(false);

  useEffect(() => {
    const beforeInstallPromptHandler = (e: Event) => {
      e.preventDefault();
      setSupportsPWA(true);
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const detectAppInstallation = () => {
      window
        .matchMedia("(display-mode: standalone)")
        .addEventListener("change", (e) => {
          setIsAppInstalled(e.matches);
        });
    };

    window.addEventListener("beforeinstallprompt", beforeInstallPromptHandler);
    detectAppInstallation();

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        beforeInstallPromptHandler
      );
    };
  }, []);

  return (
    <Container>
      <Tooltip
        title={<div translate={name ? "no" : "yes"}>{name || "User"}</div>}
      >
        <IconButton
          aria-label="Sidebar"
          aria-controls={open ? "basic-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={handleClick}
          sx={{ zIndex: 1 }}
        >
          <UserAvatar
            src={undefined}
            alt={name || "User"}
            hasimage={false}
            size="52px"
            onError={() => {
              // This prevents the error handling from being called unnecessarily when offline
              if (!navigator.onLine) return;
              setUser((prevUser) => ({
                ...prevUser,
                profilePicture: null,
              }));
              throw new Error("Error in profile picture URL");
            }}
          >
            {name ? name[0].toUpperCase() : undefined}
          </UserAvatar>
        </IconButton>
      </Tooltip>
      <StyledSwipeableDrawer
        disableBackdropTransition={true}
        disableDiscovery={false}
        id="basic-menu"
        anchor="right"
        open={open}
        onOpen={(e) => e.preventDefault()}
        onClose={handleClose}
      >
        <LogoContainer
          translate="no"
          onClick={() => {
            n("/");
            handleClose();
          }}
        >
          {/* <Logo src={logo} alt="logo" /> */}
          <LogoText>
            <span>Todo</span> App
          </LogoText>
        </LogoContainer>

        <MenuLink to="/">
          <StyledMenuItem onClick={handleClose}>
            <TaskAltRounded /> &nbsp; Tasks
            {tasks.filter((task) => !task.done).length > 0 && (
              <Tooltip
                title={`${
                  tasks.filter((task) => !task.done).length
                } tasks to do`}
              >
                <MenuLabel>
                  {tasks.filter((task) => !task.done).length > 99
                    ? "99+"
                    : tasks.filter((task) => !task.done).length}
                </MenuLabel>
              </Tooltip>
            )}
          </StyledMenuItem>
        </MenuLink>

        <MenuLink to="/add">
          <StyledMenuItem onClick={handleClose}>
            <AddRounded /> &nbsp; Add Task
          </StyledMenuItem>
        </MenuLink>
        {/* 
        {
          <MenuLink to="/categories">
            <StyledMenuItem onClick={handleClose}>
              <CategoryRounded /> &nbsp; Categories
            </StyledMenuItem>
          </MenuLink>
        } */}

        <StyledDivider />

        <MenuLink to="https://github.com/Stephen0023/react-django-todo-app">
          <StyledMenuItem translate="no">
            <GitHub /> &nbsp; Github{" "}
          </StyledMenuItem>
        </MenuLink>

        <StyledDivider />

        {/* <StyledMenuItem
          onClick={handleLogoutConfirmationOpen}
          sx={{ color: "#ff4040 !important" }}
        >
          <Logout /> &nbsp; Logout
        </StyledMenuItem> */}

        {/* <ProfileOptionsBottom>
          <SettingsMenuItem
            onClick={() => {
              setOpenSettings(true);
              handleClose();
            }}
          >
            <SettingsRounded /> &nbsp; Settings
            {settings[0] === defaultUser.settings[0] && <PulseMenuLabel />}
          </SettingsMenuItem>

          <StyledDivider />
          <MenuLink to="/user">
            <ProfileMenuItem
              translate={name ? "no" : "yes"}
              onClick={handleClose}
            >
              <UserAvatar src={undefined} hasimage={false} size="44px">
                {name ? name[0].toUpperCase() : undefined}
              </UserAvatar>
              <h4 style={{ margin: 0, fontWeight: 600 }}> {name || "User"}</h4>{" "}
              {(name === null || name === "") &&
                user.theme === defaultUser.theme && <PulseMenuLabel />}
            </ProfileMenuItem>
          </MenuLink>

          <StyledDivider />

          <CreditsContainer>
            {lastUpdate && (
              <Tooltip title={timeAgo(new Date(lastUpdate))}>
                <span>
                  Last update:{" "}
                  {new Intl.DateTimeFormat(navigator.language, {
                    dateStyle: "long",
                    timeStyle: "medium",
                  }).format(new Date(lastUpdate))}
                </span>
              </Tooltip>
            )}
          </CreditsContainer>
        </ProfileOptionsBottom> */}
      </StyledSwipeableDrawer>

      <Dialog
        open={logoutConfirmationOpen}
        onClose={handleLogoutConfirmationClose}
      >
        <DialogTitle>Logout Confirmation</DialogTitle>
        <DialogContent>
          Are you sure you want to logout? <b>Your tasks will not be saved.</b>
        </DialogContent>
        <DialogActions>
          <DialogBtn onClick={handleLogoutConfirmationClose}>Cancel</DialogBtn>
          <DialogBtn onClick={handleLogout} color="error">
            <Logout /> &nbsp; Logout
          </DialogBtn>
        </DialogActions>
      </Dialog>
      {/* <SettingsDialog
        open={openSettings}
        onClose={() => setOpenSettings(!openSettings)}
      /> */}
    </Container>
  );
};

const MenuLink = ({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) => {
  const styles: React.CSSProperties = { borderRadius: "14px" };
  if (to.startsWith("/")) {
    return (
      // React Router Link component for internal navigation
      <Link to={to} style={styles}>
        {children}
      </Link>
    );
  }
  // Render an anchor tag for external navigation
  return (
    <a href={to} target="_blank" style={styles}>
      {children}
    </a>
  );
};

export default SideBar;

const Container = styled.div`
  position: absolute;
  right: 16vw;
  top: 14px;
  z-index: 900;
  @media (max-width: 1024px) {
    right: 16px;
  }
`;

const StyledSwipeableDrawer = styled(SwipeableDrawer)`
  & .MuiPaper-root {
    border-radius: 24px 0 0 0;
    min-width: 300px;
    box-shadow: none;
    padding: 4px 12px;
    color: "#101727";
    z-index: 999;

    @media (min-width: 1920px) {
      min-width: 310px;
    }

    @media (max-width: 1024px) {
      min-width: 270px;
    }

    @media (max-width: 600px) {
      min-width: 55vw;
    }
  }
`;

const StyledMenuItem = styled(MenuItem)`
  /* margin: 0px 8px; */
  padding: 16px 12px;
  border-radius: 14px;
  box-shadow: none;
  font-weight: 500;
  gap: 6px;

  & svg,
  .bmc-icon {
    transition: 0.4s transform;
  }

  &:hover {
    & svg[data-testid="GitHubIcon"] {
      transform: rotateY(${2 * Math.PI}rad);
    }
    & svg[data-testid="BugReportRoundedIcon"] {
      transform: rotate(45deg) scale(0.9) translateY(-20%);
    }
    & .bmc-icon {
      animation: ${ring} 2.5s ease-in alternate;
    }
  }
`;

// const SettingsMenuItem = styled(StyledMenuItem)`
//   background: "#101727";
//   color: white !important;
//   margin-top: 8px !important;
//   &:hover {
//     background: ${({ theme }) => (theme.darkmode ? "#1f1f1fb2" : "#101727b2")};
//     & svg[data-testid="SettingsRoundedIcon"] {
//       transform: rotate(180deg);
//     }
//   }
// `;

const ProfileMenuItem = styled(StyledMenuItem)`
  display: flex;
  align-items: center;
  gap: 10px;
  background: "#d7d7d7";
  &:hover {
    background: "#d7d7d7b2";
  }
`;

const MenuLabel = styled.span<{ clr?: string }>`
  margin-left: auto;
  font-weight: 600;
  background: white;
  color: black};
  padding: 2px 12px;
  border-radius: 32px;
  font-size: 14px;
`;

const StyledDivider = styled(Divider)`
  margin: 8px 4px;
`;

const PulseMenuLabel = styled(MenuLabel)`
  animation: ${({ theme }) => pulseAnimation("white", 6)} 1.2s infinite;
  padding: 6px;
  margin-right: 4px;
`;

PulseMenuLabel.defaultProps = {
  children: (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <FiberManualRecord style={{ fontSize: "16px" }} />
    </div>
  ),
};

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  margin-top: 8px;
  margin-bottom: 16px;
  gap: 12px;
  cursor: pointer;
`;

const Logo = styled.img`
  width: 52px;
  height: 52px;
  margin-left: 12px;
  border-radius: 14px;
`;

const LogoText = styled.h2`
  & span {
    color: black;
  }
`;

const BmcIcon = styled.img`
  width: 1em;
  height: 1em;
  font-size: 1.5rem;
`;

const ProfileOptionsBottom = styled.div`
  margin-top: auto;
  margin-bottom: ${window.matchMedia("(display-mode: standalone)").matches &&
  /Mobi/.test(navigator.userAgent)
    ? "38px"
    : "16px"};
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CreditsContainer = styled.div`
  font-size: 12px;
  margin: 0;
  opacity: 0.8;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  & span {
    backdrop-filter: none !important;
  }
`;
