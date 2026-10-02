// app/(dashboard)/DashboardSkeleton.tsx
import { Skeleton } from "@/components/dashboard/Skeleton";
import {
    NAV_CLEARANCE,
    SPACE_3,
    SPACE_4,
    SURFACE,
} from "@/components/dashboard/dashboardUI";
import { ScrollView, StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DashboardSkeleton() {
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: SURFACE }}>
      <StatusBar barStyle="dark-content" backgroundColor={SURFACE} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: SPACE_3,
          paddingBottom: NAV_CLEARANCE,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header — avatar + name/role */}
        <View className="flex-row items-center px-4" style={{ gap: 12 }}>
          <Skeleton width={44} height={44} borderRadius={22} />
          <View style={{ gap: 6 }}>
            <Skeleton width={140} height={14} />
            <Skeleton width={100} height={12} />
          </View>
        </View>

        {/* Greeting banner */}
        <View className="px-4" style={{ marginTop: SPACE_4 }}>
          <Skeleton width="100%" height={90} borderRadius={16} />
        </View>

        {/* Pill row — branch / date / search */}
        <View className="flex-row px-4" style={{ marginTop: SPACE_3, gap: 8 }}>
          <Skeleton width={120} height={36} borderRadius={18} />
          <Skeleton width={130} height={36} borderRadius={18} />
          <Skeleton width={36} height={36} borderRadius={18} />
        </View>

        {/* Page title */}
        <View className="px-4" style={{ marginTop: SPACE_4, gap: 6 }}>
          <Skeleton width={120} height={20} />
          <Skeleton width={220} height={12} />
        </View>

        <View className="px-4" style={{ marginTop: SPACE_3 }}>
          {/* Alert banner */}
          <Skeleton
            width="100%"
            height={80}
            borderRadius={14}
            style={{ marginBottom: SPACE_3 }}
          />

          {/* Stat cards — 3 of them, same shape as StatCard/GradientStatCard */}
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              width="100%"
              height={i === 3 ? 160 : 130}
              borderRadius={16}
              style={{ marginBottom: SPACE_3 }}
            />
          ))}

          {/* Section heading */}
          <View
            className="flex-row items-center justify-between"
            style={{ marginBottom: SPACE_3 }}
          >
            <Skeleton width={160} height={16} />
            <Skeleton width={60} height={14} />
          </View>

          {/* Filter chips */}
          <View className="flex-row" style={{ gap: 8, marginBottom: SPACE_3 }}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} width={70} height={32} borderRadius={16} />
            ))}
          </View>

          {/* Transaction rows */}
          {[1, 2, 3].map((i) => (
            <View
              key={i}
              className="flex-row items-center justify-between"
              style={{ paddingVertical: 12, gap: 12 }}
            >
              <View style={{ flex: 1, gap: 6 }}>
                <Skeleton width="70%" height={14} />
                <Skeleton width="40%" height={11} />
              </View>
              <Skeleton width={70} height={16} />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
