"use client";
import { useEffect, useState, useRef } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import {
  LogIn,
  LogOut,
  Palette,
  Trophy,
  BarChart3,
  Upload,
  Flame,
  Sparkles,
  Code2,
  Youtube,
  BookOpen,
  Crown,
  MoonStar,
  Home,
  MessageSquare,
  ChevronDown,
  Settings,
  User,
  Menu,
  X,
  Zap,
  Globe,
} from "lucide-react";
import { Sun, Moon } from "lucide-react";
import Image from "next/image";
import PremiumGoogleTranslate from "../PremiumGoogleTranslate";
import { useContext } from "react";
import xpContext from "@/contexts/xp";
import { useNightMode } from "@/contexts/nightMode";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState("light");
  const [streak, setStreak] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { xp, show, changed } = useContext(xpContext);
  const { nightMode, toggleNightMode } = useNightMode();
  const router = useRouter();
  const pathname = usePathname();

  const isActiveLink = (href) => {
    return pathname === href || (href === "/roadmap" && pathname === "/");
  };

  const isActiveGroup = (paths) => {
    return paths.some(p => pathname?.startsWith(p) || isActiveLink(p));
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.className = savedTheme;
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.className = newTheme;
  };

  useEffect(() => {
    if (user?.email) {
      fetchStreak(user.email);
      fetchPremiumStatus(user.email);
    }
  }, [user]);

  const fetchPremiumStatus = async (email) => {
    try {
      const res = await fetch(`/api/premium/status`);
      const data = await res.json();
      setIsPremium(data.isPremium || false);
    } catch (error) {
      console.error("Error fetching premium status:", error);
    }
  };

  const fetchStreak = async (email) => {
    try {
      const res = await fetch(`/api/gamification/stats?userId=${email}`);
      const data = await res.json();
      setStreak(data.streak || 0);
    } catch (error) {
      console.error("Error fetching streak:", error);
    }
  };

  const signOutUser = async () => {
    try {
      await logout();
      window.location.replace("/");
    } catch (error) {
      console.error("Logout error:", error);
      window.location.replace("/");
    }
  };

  // Navigation items for logged-in users
  const createMenuItems = [
    { href: "/generate", label: "AI Course Generator", icon: Sparkles, description: "Create courses with AI" },
    { href: "/studio", label: "Course Studio", icon: Palette, description: "Design custom courses" },
    { href: "/content-ingestion", label: "Content Ingestion", icon: Upload, description: "Import existing content" },
    { href: "/youtube-course", label: "YouTube Course", icon: Youtube, description: "Learn from YouTube" },
  ];

  const learnMenuItems = [
    { href: "/roadmap", label: "My Courses", icon: Home, description: "Your learning dashboard" },
    { href: "/courses", label: "Browse Courses", icon: BookOpen, description: "Explore all courses" },
    { href: "/code-editor", label: "Code Editor", icon: Code2, description: "Practice coding" },
  ];

  const moreMenuItems = [
    { href: "/features", label: "Features", icon: Trophy, description: "Platform features" },
    { href: "/gamification", label: "Achievements", icon: Zap, description: "Badges & rewards" },
    { href: "/demo", label: "Demo", icon: BarChart3, description: "See how it works" },
    { href: "/contact", label: "Contact", icon: MessageSquare, description: "Get in touch" },
  ];

  // Landing page navigation
  const landingNavItems = [
    { id: "features", label: "Features" },
    { id: "how-it-works", label: "How It Works" },
    { id: "faq", label: "FAQ" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <header className="h-16 w-full border-b fixed top-0 left-0 bg-background/80 backdrop-blur-xl z-50 border-border">
      <div className="h-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 flex items-center justify-between">
        {/* Logo - Left */}
        <Link
          href={user ? `/roadmap` : "/"}
          className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity flex-shrink-0"
        >
          <Image src="/InnoVision_LOGO-removebg-preview.png" alt="logo" width={28} height={28} className="sm:w-8 sm:h-8" />
          <span className="text-sm sm:text-base font-light text-foreground">InnoVision</span>
        </Link>

        {/* Desktop Navigation - Centered */}
        <nav className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2">
          {user ? (
            // Logged in users - show ALL 11 nav items with icons only
            <div className="flex items-center gap-0.5 px-2 py-1.5 rounded-full border border-border/50 bg-card/80 backdrop-blur-md shadow-sm">
              {[...createMenuItems, ...learnMenuItems, ...moreMenuItems].map((item) => (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link href={item.href}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 w-8 p-0 rounded-full font-light ${isActiveLink(item.href) ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted hover:text-foreground'}`}
                      >
                        <item.icon className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent className="bg-popover border-border">
                    <p className="font-light text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground font-light">{item.description}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          ) : (
            // Landing page nav - pill style buttons with text
            <div className="flex items-center gap-0.5 px-2 py-1.5 rounded-full border border-border/50 bg-card/80 backdrop-blur-md shadow-sm">
              {landingNavItems.map((item) => (
                <Button
                  key={item.id || item.href}
                  variant="ghost"
                  size="sm"
                  asChild={!!item.href}
                  onClick={() => {
                    if (item.id) {
                      document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="text-sm font-light text-foreground hover:bg-muted hover:text-foreground rounded-full h-8 px-4 transition-colors"
                >
                  {item.href ? (
                    <Link href={item.href}>{item.label}</Link>
                  ) : (
                    <span className="cursor-pointer">{item.label}</span>
                  )}
                </Button>
              ))}
            </div>
          )}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {user && (
            <>
              {/* Premium Badge */}
              {isPremium && (
                <Link href="/premium" className="hidden lg:flex">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-yellow-500/20 bg-yellow-500/10 hover:border-yellow-500/30 transition-colors">
                    <Crown className="h-3.5 w-3.5 text-yellow-500" />
                    <span className="text-xs font-light text-yellow-400">PRO</span>
                  </div>
                </Link>
              )}

              {/* XP */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-green-500/20 bg-green-500/10 cursor-help relative">
                    <Sparkles className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-xs font-light text-green-400">{xp}</span>
                    {show && (
                      <motion.span
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: -10 }}
                        exit={{ opacity: 0 }}
                        className="absolute -top-2 right-0 text-xs text-green-400 font-light"
                      >
                        +{changed}
                      </motion.span>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-black border-white/10">
                  <p className="font-light text-white">Level {Math.floor(xp / 500) + 1}</p>
                  <p className="text-xs text-gray-400 font-light">{xp} XP earned</p>
                </TooltipContent>
              </Tooltip>

              {/* Streak */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-orange-500/20 bg-orange-500/10 cursor-help">
                    <Flame className={`h-3.5 w-3.5 ${streak >= 7 ? 'text-red-500' : 'text-orange-500'}`} />
                    <span className={`text-xs font-light ${streak >= 7 ? 'text-red-400' : 'text-orange-400'}`}>
                      {streak}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-black border-white/10">
                  <p className="font-light text-white">{streak} Day Streak!</p>
                  <p className="text-xs text-gray-400 font-light">Keep learning daily</p>
                </TooltipContent>
              </Tooltip>
            </>
          )}

          {/* Theme Toggle - Always visible */}
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8 sm:h-9 sm:w-9 rounded-full hover:bg-muted text-foreground">
            {theme === "light" ? <Moon className="h-4 w-4 sm:h-4 sm:w-4" /> : <Sun className="h-4 w-4 sm:h-4 sm:w-4" />}
          </Button>

          {/* Night Mode - Always visible */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleNightMode}
                className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full hover:bg-muted ${nightMode ? 'text-amber-400' : 'text-foreground'}`}
              >
                <MoonStar className={`h-4 w-4 sm:h-4 sm:w-4 ${nightMode ? 'fill-amber-400' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-background border-border">
              <p className="font-light text-foreground">Night Mode (Blue Light Filter)</p>
            </TooltipContent>
          </Tooltip>

          {/* User Menu or Login */}
          {user ? (
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Profile Avatar - Direct Link */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/profile" className="relative hidden sm:block">
                    <Avatar className="h-8 w-8 sm:h-9 sm:w-9 ring-2 ring-transparent hover:ring-blue-500/50 transition-all cursor-pointer">
                      <AvatarImage src={user?.image || "/default-avatar.png"} alt={user?.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-sm font-light">
                        {user?.name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    {isPremium && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-yellow-500 flex items-center justify-center">
                        <Crown className="h-2 w-2 text-black" />
                      </span>
                    )}
                  </Link>
                </TooltipTrigger>
                <TooltipContent className="bg-black border-white/10">
                  <p className="font-light text-white">View Profile</p>
                </TooltipContent>
              </Tooltip>

              {/* Settings Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 rounded-full hover:bg-muted text-foreground">
                    <Settings className="h-4 w-4 sm:h-4 sm:w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-background border-border">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-light text-foreground">{user?.name}</span>
                      <span className="text-xs text-muted-foreground font-light truncate">{user?.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border" />
                  
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <Link href="/gamification" className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      Achievements
                    </Link>
                  </DropdownMenuItem>

                  {!isPremium && (
                    <DropdownMenuItem asChild>
                      <Link href="/premium" className="flex items-center gap-2 text-yellow-600">
                        <Crown className="h-4 w-4" />
                        Upgrade to Pro
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />

                  {/* Mobile only stats */}
                  <div className="sm:hidden px-2 py-1.5 space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">XP</span>
                    <span className="font-medium text-green-600">{xp}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Streak</span>
                    <span className="font-medium text-orange-600">{streak} days</span>
                  </div>
                </div>
                <DropdownMenuSeparator className="sm:hidden" />

                <div className="px-2 py-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Night Mode</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleNightMode}
                      className={`h-8 w-8 p-0 ${nightMode ? 'text-amber-500' : ''}`}
                    >
                      <MoonStar className={`h-4 w-4 ${nightMode ? 'fill-amber-500' : ''}`} />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Theme</span>
                    <Button variant="ghost" size="sm" onClick={toggleTheme} className="h-8 w-8 p-0">
                      {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <DropdownMenuSeparator />

                <div className="px-2 py-1.5">
                  <p className="text-xs text-muted-foreground mb-1">Language</p>
                  <PremiumGoogleTranslate />
                </div>

                <DropdownMenuSeparator />

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-500 focus:text-red-500">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        You will be logged out from your current session.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-destructive text-white" onClick={signOutUser}>
                        Logout
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
          ) : (
            <Link href="/login" className="flex-shrink-0">
              <Button size="sm" className="bg-transparent border border-border hover:bg-muted text-foreground h-8 px-4 text-xs sm:text-sm sm:h-9 sm:px-5 rounded-full font-light">
                Get Started
              </Button>
            </Link>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8 sm:h-9 sm:w-9 rounded-full hover:bg-muted text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl"
          >
            <nav className="p-4 space-y-2">
              {user ? (
                <>
                  <p className="text-xs font-light text-muted-foreground uppercase tracking-wider px-2 mb-2">Create</p>
                  {createMenuItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-light ${
                        isActiveLink(item.href) ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  ))}

                  <p className="text-xs font-light text-muted-foreground uppercase tracking-wider px-2 mb-2 mt-4">Learn</p>
                  {learnMenuItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-light ${
                        isActiveLink(item.href) ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  ))}

                  <p className="text-xs font-light text-muted-foreground uppercase tracking-wider px-2 mb-2 mt-4">More</p>
                  {moreMenuItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-light ${
                        isActiveLink(item.href) ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  ))}
                </>
              ) : (
                <>
                  {landingNavItems.map((item) => (
                    <button
                      key={item.id || item.href}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        if (item.id) {
                          document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
                        } else if (item.href) {
                          router.push(item.href);
                        }
                      }}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground w-full text-left font-light"
                    >
                      {item.label}
                    </button>
                  ))}
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;