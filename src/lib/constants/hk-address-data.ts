export const HK_REGIONS = [
    {
        value: "HK",
        label: "香港島",
        districts: [
            { value: "中西區", label: "中西區" },
            { value: "東區", label: "東區" },
            { value: "南區", label: "南區" },
            { value: "灣仔區", label: "灣仔區" },
        ],
    },
    {
        value: "KLN",
        label: "九龍",
        districts: [
            { value: "九龍城區", label: "九龍城區" },
            { value: "觀塘區", label: "觀塘區" },
            { value: "深水埗區", label: "深水埗區" },
            { value: "黃大仙區", label: "黃大仙區" },
            { value: "油尖旺區", label: "油尖旺區" },
        ],
    },
    {
        value: "NT",
        label: "新界",
        districts: [
            { value: "離島區", label: "離島區" },
            { value: "葵青區", label: "葵青區" },
            { value: "北區", label: "北區" },
            { value: "西貢區", label: "西貢區" },
            { value: "沙田區", label: "沙田區" },
            { value: "大埔區", label: "大埔區" },
            { value: "荃灣區", label: "荃灣區" },
            { value: "屯門區", label: "屯門區" },
            { value: "元朗區", label: "元朗區" },
        ],
    },
];

export const getRegionByDistrict = (districtValue: string): string => {
    if (!districtValue) return "";
    for (const region of HK_REGIONS) {
        if (region.districts.some((d) => d.value === districtValue)) {
            return region.value;
        }
    }
    return "";
};

export const getRegionLabel = (regionValue: string): string => {
    const region = HK_REGIONS.find((r) => r.value === regionValue);
    return region?.label || "";
};

export const getDistrictsByRegion = (regionValue: string) => {
    const region = HK_REGIONS.find((r) => r.value === regionValue);
    return region?.districts || [];
};
