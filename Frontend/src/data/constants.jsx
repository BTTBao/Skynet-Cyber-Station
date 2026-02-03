import { UserRole } from "./type"

export const MOCK_USERS = [
    {
        id: "u1",
        name: "TS. Nguyễn Văn A",
        role: UserRole.LECTURER,
        avatar: "https://picsum.photos/id/1/200/200"
    },
    {
        id: "u2",
        name: "Sinh viên Trần Thị B",
        role: UserRole.STUDENT,
        avatar: "https://picsum.photos/id/2/200/200"
    },
    {
        id: "u3",
        name: "Khách ngoài C",
        role: UserRole.GUEST,
        avatar: "https://picsum.photos/id/3/200/200"
    }
]

export const MOCK_ROOMS = [
    {
        id: "1",
        name: "Lab AI & Data Science",
        capacity: 30,
        machineCount: 30,
        specs: {
            cpu: "Intel Core i9-13900K",
            ram: "64GB DDR5",
            gpu: "NVIDIA RTX 4090 24GB",
            storage: "2TB NVMe SSD"
        },
        pricePerHour: 200000,
        image: "https://picsum.photos/id/4/800/600",
        features: ["Máy chiếu 4K", "Bảng thông minh", "Hệ thống âm thanh"],
        software: [
            "Python 3.11",
            "TensorFlow",
            "PyTorch",
            "CUDA Toolkit",
            "Jupyter Lab",
            "Matlab"
        ]
    },
    {
        id: "2",
        name: "Lab Lập trình cơ bản",
        capacity: 40,
        machineCount: 40,
        specs: {
            cpu: "Intel Core i5-13400",
            ram: "16GB DDR4",
            gpu: "Integrated Graphics",
            storage: "512GB SSD"
        },
        pricePerHour: 100000,
        image: "https://picsum.photos/id/5/800/600",
        features: ["Máy chiếu", "Bảng trắng"],
        software: [
            "Visual Studio Code",
            "Git",
            "Java JDK 17",
            "C/C++ Compiler",
            "XAMPP"
        ]
    },
    {
        id: "3",
        name: "Studio Đồ họa & Multimedia",
        capacity: 20,
        machineCount: 20,
        specs: {
            cpu: "Apple M2 Pro",
            ram: "32GB",
            gpu: "19-core GPU",
            storage: "1TB SSD"
        },
        pricePerHour: 250000,
        image: "https://picsum.photos/id/6/800/600",
        features: ["Màn hình màu chuẩn", "Wacom Tablet", "Phòng cách âm"],
        software: [
            "Adobe Creative Cloud",
            "Blender",
            "Cinema 4D",
            "Final Cut Pro",
            "Logic Pro"
        ]
    },
    {
        id: "r4",
        name: "Phòng thực hành Mạng",
        capacity: 35,
        machineCount: 35,
        specs: {
            cpu: "Intel Core i7-12700",
            ram: "32GB",
            gpu: "NVIDIA GTX 1660 Super",
            storage: "512GB SSD"
        },
        pricePerHour: 150000,
        image: "https://picsum.photos/id/8/800/600",
        features: ["Rack Server", "Switch Cisco", "Router thực hành"],
        software: [
            "Cisco Packet Tracer",
            "Wireshark",
            "VMware Workstation",
            "GNS3",
            "Linux Ubuntu"
        ]
    }
]

export const TIME_SLOTS = Array.from({ length: 14 }, (_, i) => i + 7) // 7:00 to 20:00
