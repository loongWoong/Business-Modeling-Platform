package com.jianmo.platform.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class GraphVO {
    private List<ModelVO> models;
    private List<GraphEdge> edges;

    @Data
    public static class GraphEdge {
        private Long source;
        private Long target;

        public GraphEdge() {
        }

        public GraphEdge(Long source, Long target) {
            this.source = source;
            this.target = target;
        }
    }

    public GraphVO() {
    }

    public GraphVO(List<ModelVO> models, List<GraphEdge> edges) {
        this.models = models;
        this.edges = edges;
    }
}
