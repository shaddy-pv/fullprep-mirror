export interface MockProblem {
  slug: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topic: string;
  tags: string[];
  description: string;
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  constraints: string[];
  starterCode: Record<string, string>;
  acceptance: string;
  submissions: string;
  upvotes: number;
  downvotes: number;
}

export const MOCK_PROBLEMS: MockProblem[] = [
  {
    slug: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    topic: "Arrays",
    tags: ["Array", "Hash Table"],
    description: `Given an array of integers <code class="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/[0.06] text-brand-orange font-mono text-[12px] font-semibold">nums</code> and an integer <code class="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/[0.06] text-brand-orange font-mono text-[12px] font-semibold">target</code>, return <em>indices of the two numbers such that they add up to <code class="font-mono text-brand-orange">target</code></em>.
    <p class="mt-3">You may assume that each input would have <strong><em>exactly</em> one solution</strong>, and you may not use the <em>same</em> element twice.</p>
    <p class="mt-3">You can return the answer in any order.</p>`,
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
      },
      {
        input: "nums = [3,3], target = 6",
        output: "[0,1]",
      },
    ],
    constraints: [
      "2 <= nums.length <= 10⁴",
      "-10⁹ <= nums[i] <= 10⁹",
      "-10⁹ <= target <= 10⁹",
      "Only one valid answer exists.",
    ],
    upvotes: 12500,
    downvotes: 368,
    acceptance: "81.21%",
    submissions: "2.4M",
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
};`,
      python: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        hashmap = {}
        for i, num in enumerate(nums):
            complement = target - num
            if complement in hashmap:
                return [hashmap[complement], i]
            hashmap[num] = i
        return []`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[0];
    }
}`,
      cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> map;
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            if (map.count(complement)) {
                return {map[complement], i};
            }
            map[nums[i]] = i;
        }
        return {};
    }
};`,
    },
  },
  {
    slug: "binary-search",
    title: "Binary Search",
    difficulty: "Easy",
    topic: "Searching",
    tags: ["Array", "Binary Search"],
    description: `Given an array of integers <code class="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/[0.06] text-brand-orange font-mono text-[12px] font-semibold">nums</code> which is sorted in ascending order, and an integer <code class="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/[0.06] text-brand-orange font-mono text-[12px] font-semibold">target</code>, write a function to search <code class="font-mono text-brand-orange">target</code> in <code class="font-mono text-brand-orange">nums</code>.
    <p class="mt-3">If <code class="font-mono">target</code> exists, then return its index. Otherwise, return <code class="font-mono text-brand-orange">-1</code>.</p>
    <p class="mt-3">You must write an algorithm with <code class="font-mono">O(log n)</code> runtime complexity.</p>`,
    examples: [
      {
        input: "nums = [-1,0,3,5,9,12], target = 9",
        output: "4",
        explanation: "9 exists in nums and its index is 4",
      },
      {
        input: "nums = [-1,0,3,5,9,12], target = 2",
        output: "-1",
        explanation: "2 does not exist in nums so return -1",
      },
    ],
    constraints: [
      "1 <= nums.length <= 10⁴",
      "-10⁴ < nums[i], target < 10⁴",
      "All the integers in nums are unique.",
      "nums is sorted in ascending order.",
    ],
    upvotes: 6840,
    downvotes: 182,
    acceptance: "74.31%",
    submissions: "893K",
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
var search = function(nums, target) {
    let left = 0;
    let right = nums.length - 1;
    while (left <= right) {
        const mid = left + Math.floor((right - left) / 2);
        if (nums[mid] === target) {
            return mid;
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return -1;
};`,
      python: `class Solution:
    def search(self, nums: List[int], target: int) -> int:
        left, right = 0, len(nums) - 1
        while left <= right:
            mid = left + (right - left) // 2
            if nums[mid] == target:
                return mid
            elif nums[mid] < target:
                left = mid + 1
            else:
                right = mid - 1
        return -1`,
      java: `class Solution {
    public int search(int[] nums, int target) {
        int left = 0;
        int right = nums.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) {
                return mid;
            } else if (nums[mid] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        return -1;
    }
}`,
      cpp: `class Solution {
public:
    int search(vector<int>& nums, int target) {
        int left = 0;
        int right = nums.size() - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) {
                return mid;
            } else if (nums[mid] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        return -1;
    }
};`,
    },
  },
  {
    slug: "merge-intervals",
    title: "Merge Intervals",
    difficulty: "Medium",
    topic: "Sorting",
    tags: ["Array", "Sorting"],
    description: `Given an array of <code class="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/[0.06] text-brand-orange font-mono text-[12px] font-semibold">intervals</code> where <code class="font-mono">intervals[i] = [start<sub>i</sub>, end<sub>i</sub>]</code>, merge all overlapping intervals.
    <p class="mt-3">Return <em>an array of the non-overlapping intervals that cover all the intervals in the input</em>.</p>`,
    examples: [
      {
        input: "intervals = [[1,3],[2,6],[8,10],[15,18]]",
        output: "[[1,6],[8,10],[15,18]]",
        explanation: "Since intervals [1,3] and [2,6] overlap, merge them into [1,6].",
      },
      {
        input: "intervals = [[1,4],[4,5]]",
        output: "[[1,5]]",
        explanation: "Intervals [1,4] and [4,5] are considered overlapping.",
      },
    ],
    constraints: [
      "1 <= intervals.length <= 10⁴",
      "intervals[i].length == 2",
      "0 <= start_i <= end_i <= 10⁴",
    ],
    upvotes: 9410,
    downvotes: 245,
    acceptance: "68.54%",
    submissions: "312K",
    starterCode: {
      javascript: `/**
 * @param {number[][]} intervals
 * @return {number[][]}
 */
var merge = function(intervals) {
    if (intervals.length <= 1) return intervals;
    intervals.sort((a, b) => a[0] - b[0]);
    const result = [intervals[0]];
    for (let i = 1; i < intervals.length; i++) {
        const current = intervals[i];
        const last = result[result.length - 1];
        if (current[0] <= last[1]) {
            last[1] = Math.max(last[1], current[1]);
        } else {
            result.push(current);
        }
    }
    return result;
};`,
      python: `class Solution:
    def merge(self, intervals: List[List[int]]) -> List[List[int]]:
        intervals.sort(key=lambda x: x[0])
        merged = []
        for interval in intervals:
            if not merged or merged[-1][1] < interval[0]:
                merged.append(interval)
            else:
                merged[-1][1] = max(merged[-1][1], interval[1])
        return merged`,
      java: `class Solution {
    public int[][] merge(int[][] intervals) {
        if (intervals.length <= 1) return intervals;
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
        List<int[]> result = new ArrayList<>();
        int[] current = intervals[0];
        result.add(current);
        for (int[] interval : intervals) {
            if (interval[0] <= current[1]) {
                current[1] = Math.max(current[1], interval[1]);
            } else {
                current = interval;
                result.add(current);
            }
        }
        return result.toArray(new int[result.size()][]);
    }
}`,
      cpp: `class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        if (intervals.empty()) return {};
        sort(intervals.begin(), intervals.end());
        vector<vector<int>> merged;
        merged.push_back(intervals[0]);
        for (int i = 1; i < intervals.size(); i++) {
            if (intervals[i][0] <= merged.back()[1]) {
                merged.back()[1] = max(merged.back()[1], intervals[i][1]);
            } else {
                merged.push_back(intervals[i]);
            }
        }
        return merged;
    }
};`,
    },
  },
];
